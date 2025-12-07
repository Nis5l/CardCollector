use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::State;
use rocket::http::Status;
use chrono::Utc;

use super::data::FriendAcceptResponse;
use super::sql;
use crate::shared::crypto::JwtToken;
use crate::shared::notification;
use crate::sql::Sql;
use crate::verify_user;
use crate::shared::Id;

#[post("/friend/<friend_user_id>/accept")]
pub async fn friend_accept_route(friend_user_id: Id, token: JwtToken, sql: &State<Sql>) -> ApiResponseErr<FriendAcceptResponse> {
    let JwtToken { id: user_id, username } = token;

    verify_user!(sql, &user_id, true);
    let accept_username = verify_user!(sql, &friend_user_id, false);

    if !rjtry!(sql::accept_friend_request(sql, &user_id, &friend_user_id).await) {
        return ApiResponseErr::api_err(Status::NotFound, format!("No friend request by user {}", &friend_user_id));
    }

    rjtry!(notification::sql::add_notification(sql, &friend_user_id, None, &notification::data::NotificationCreateData {
        title: String::from("Friend Request Accepted"),
        message: format!("{} accepted your friend request, click to view!", username),
        url: format!("/user/{}", user_id),
        time: Utc::now()
    }).await);

    ApiResponseErr::ok(Status::Ok, FriendAcceptResponse {
        message: format!("Accepted friend request from {}", accept_username)
    })
}
