use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::http::Status;
use rocket::State; use chrono::Utc;

use super::data::TradeCardAddResponse;
use super::sql;
use crate::shared::crypto::JwtToken;
use crate::sql::Sql;
use crate::config::Config;
use crate::shared::{friend, card, trade, notification};
use crate::shared::Id;
use crate::{verify_user, verify_collector};

#[post("/trade/<user_friend_id>/<collector_id>/card/add/<card_unlocked_id>")]
pub async fn trade_card_add_route(card_unlocked_id: Id, user_friend_id: Id, collector_id: Id, sql: &State<Sql>, config: &State<Config>, token: JwtToken) -> ApiResponseErr<TradeCardAddResponse> {
    let JwtToken { id: user_id, username } = token;

    verify_user!(sql, &user_id, true);
    //NOTE: could be removed if not for the username
    let user_friend_username = verify_user!(sql, &user_friend_id, false);
    verify_collector!(sql, &collector_id);

    if !rjtry!(friend::sql::user_has_friend(sql, &user_id, &user_friend_id).await) {
        return ApiResponseErr::api_err(Status::NotFound, format!("You are not a friend with {}", user_friend_username));
    }

    let trade_id = rjtry!(trade::sql::create_trade(sql, &Id::new(config.id_length), &user_id, &user_friend_id, &collector_id).await);

    if !rjtry!(card::sql::user_owns_card(sql, &user_id, &card_unlocked_id, Some(&collector_id)).await) {
        return ApiResponseErr::api_err(Status::NotFound,
                                       format!("The card with the id {} does not exist or is not owned by {} in the collector {}",
                                               &card_unlocked_id,
                                               &user_id,
                                               &collector_id
                                        ));
    }

    if rjtry!(sql::trade_card_count(sql, &user_id, &trade_id).await) >= config.trade_card_limit as i64 {
        return ApiResponseErr::api_err(Status::Conflict, format!("Max card limit of {} for trade reached", config.trade_card_limit));
    }

    if rjtry!(trade::sql::card_in_trade(sql, &card_unlocked_id).await) {
        return ApiResponseErr::api_err(Status::Conflict, format!("Card with id {} is already in a trade", &card_unlocked_id));
    }

    rjtry!(trade::sql::trade_add_card(sql, &trade_id, &card_unlocked_id).await);

    rjtry!(sql::remove_suggestions(sql, &card_unlocked_id).await);

    rjtry!(trade::sql::set_trade_status(sql, &trade_id, trade::data::TradeStatus::UnConfirmed).await);

    let notification = if rjtry!(trade::sql::suggestion_in_trade(sql, &trade_id, &card_unlocked_id).await) {
        notification::data::NotificationCreateData {
            title: String::from("Card Suggestion Accepted"),
            message: format!("{} accepted a card suggestion you made, click to view!", username),
            url: format!("trade/{}", &user_id),
            time: Utc::now()
        }
    } else {
        notification::data::NotificationCreateData {
            title: String::from("Card Added To Trade"),
            message: format!("{} added a new card to the trade, click to view!", &username),
            url: format!("trade/{}", &user_id),
            time: Utc::now()
        }
    };

    rjtry!(notification::sql::add_notification(sql, &user_friend_id, Some(&collector_id), &notification).await);

    ApiResponseErr::ok(Status::Ok, TradeCardAddResponse {
        message: format!("Successfully added card {} to the trade", &card_unlocked_id)
    })
}
