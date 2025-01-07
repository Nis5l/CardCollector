use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::State;
use rocket::http::Status;
use chrono::Utc;

use super::data::FriendRemoveResponse;
use super::sql;
use crate::shared::notification;
use crate::sql::Sql;
use crate::shared::crypto::JwtToken;
use crate::verify_user;
use crate::shared::Id;

#[post("/friend/<friend_user_id>/remove")]
pub async fn friend_remove_route(friend_user_id: Id, sql: &State<Sql>, token: JwtToken) -> ApiResponseErr<FriendRemoveResponse> {
    let JwtToken { id: user_id, username } = token;

    verify_user!(sql, &user_id, true);
    let friend_username = verify_user!(sql, &friend_user_id, false);

    if !rjtry!(sql::remove_friend(sql, &user_id, &friend_user_id).await) {
        return ApiResponseErr::api_err(Status::Conflict, format!("Not friend with {}", &friend_username));
    }

    //TODO: clear trade

    rjtry!(notification::sql::add_notification(sql, &friend_user_id, None, &notification::data::NotificationCreateData {
        title: String::from("Friend Removed"),
        message: format!("{} removed you as a friend", &username),
        url: format!("/user/{}", user_id),
        time: Utc::now()
    }).await);

    ApiResponseErr::ok(Status::Ok, FriendRemoveResponse {
        message: format!("Removed {} as a friend", &friend_username)
    })
}
