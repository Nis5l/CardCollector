use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::http::Status;
use rocket::State;
use chrono::Utc;

use crate::sql::Sql;
use crate::shared::Id;
use crate::shared::{friend, card, trade, notification};
use crate::shared::crypto::JwtToken;
use crate::{verify_user, verify_collector};
use crate::config::Config;
use super::data::TradeSuggestionAddResponse;
use super::sql;

#[post("/trade/<user_friend_id>/<collector_id>/suggestion/add/<card_unlocked_id>")]
pub async fn trade_suggestion_add_route(user_friend_id: Id, card_unlocked_id: Id, collector_id: Id, sql: &State<Sql>, config: &State<Config>, token: JwtToken) -> ApiResponseErr<TradeSuggestionAddResponse> {
    let JwtToken { id: user_id, username } = token;

    verify_user!(sql, &user_id, false);
    //NOTE: could be removed if not for the username
    let user_friend_username = verify_user!(sql, &user_friend_id, false);
    verify_collector!(sql, &collector_id);

    if !rjtry!(friend::sql::user_has_friend(sql, &user_id, &user_friend_id).await) {
        return ApiResponseErr::api_err(Status::NotFound, format!("You are not friends with {}", &user_friend_id));
    }
    let trade_id = rjtry!(trade::sql::create_trade(sql, &Id::new(config.id_length), &user_id, &user_friend_id, &collector_id).await);

    if !rjtry!(card::sql::user_owns_card(sql, &user_friend_id, &card_unlocked_id, Some(&collector_id)).await) {
        return ApiResponseErr::api_err(Status::NotFound,
                                       format!("The card with the id {} does not exist or is not owned by {} in the collector {}",
                                               &card_unlocked_id,
                                               &user_friend_username,
                                               &collector_id
                                        ));
    }

    if rjtry!(trade::sql::card_in_trade(sql, &card_unlocked_id).await) {
        return ApiResponseErr::api_err(Status::Conflict, format!("Card with id {} is already in a trade", &card_unlocked_id));
    }

    if rjtry!(trade::sql::suggestion_in_trade(sql, &trade_id, &card_unlocked_id).await) {
        return ApiResponseErr::api_err(Status::Conflict, format!("Card with id {} is already suggested in the trade with {}", &card_unlocked_id, &user_friend_username));
    }

    rjtry!(sql::trade_suggestion_add(sql, &trade_id, &card_unlocked_id).await);

    rjtry!(notification::sql::add_notification(sql, &user_friend_id, Some(&collector_id), &notification::data::NotificationCreateData {
        title: String::from("Suggestion Added To Trade"),
        message: format!("{} added a new suggestion to the trade, click to view!", &username),
        url: format!("trade/{}", &user_id),
        time: Utc::now()
    }).await);

    ApiResponseErr::ok(Status::Ok, TradeSuggestionAddResponse {
        message: format!("Successfully added suggestion {} to the trade", &card_unlocked_id)
    })
}
