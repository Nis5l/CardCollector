use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::State;
use rocket::http::Status;
use chrono::Utc;

use crate::shared::Id;
use crate::sql::Sql;
use crate::shared::crypto::JwtToken;
use crate::shared::{friend, notification, trade};
use crate::{verify_user, verify_collector};
use crate::config::Config;
use super::data::TradeSuggestionRemoveResponse;
use super::sql;

#[post("/trade/<user_friend_id>/<collector_id>/suggestion/remove/<card_unlocked_id>")]
pub async fn trade_suggestion_remove_route(user_friend_id: Id, card_unlocked_id: Id, collector_id: Id, sql: &State<Sql>, config: &State<Config>, token: JwtToken) -> ApiResponseErr<TradeSuggestionRemoveResponse> {
    let JwtToken { id: user_id, username } = token;

    verify_user!(sql, &user_id, true);
    //NOTE: could be removed if not for the username
    let user_friend_username = verify_user!(sql, &user_friend_id, false);
    verify_collector!(sql, &collector_id);

    if !rjtry!(friend::sql::user_has_friend(sql, &user_id, &user_friend_id).await) {
        return ApiResponseErr::api_err(Status::NotFound, format!("You are not friends with {}", user_friend_id));
    }
    let trade_id = rjtry!(trade::sql::create_trade(sql, &Id::new(config.id_length), &user_id, &user_friend_id, &collector_id).await);

    if !rjtry!(sql::remove_suggestion(sql, &trade_id, &card_unlocked_id).await){
        return ApiResponseErr::api_err(Status::NotFound,
                                   format!("The card with the id {} is not in the trade with the user {}",
                                           &card_unlocked_id, &user_friend_username));
    }

    rjtry!(notification::sql::add_notification(sql, &user_friend_id, Some(&collector_id), &notification::data::NotificationCreateData {
        title: String::from("Card Suggestion Removed"),
        message: format!("{} removed a card suggestion, click to view!", username),
        url: format!("user/{}/trade/{}", &user_id, &collector_id),
        time: Utc::now()
    }).await);

    ApiResponseErr::ok(Status::Ok, TradeSuggestionRemoveResponse {
        message: format!("Removed suggestion with id {} from Trade with {}", card_unlocked_id, user_friend_username)
    })
}
