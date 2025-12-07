use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::http::Status;
use rocket::State;
use chrono::Utc;

use super::data::FriendAddResponse;
use super::sql;
use crate::shared::{ Id, friend, notification};
use crate::sql::Sql;
use crate::shared::crypto::JwtToken;
use crate::config::Config;
use crate::verify_user;

#[post("/friend/<friend_user_id>/add")]
pub async fn friend_add_route(friend_user_id: Id, sql: &State<Sql>, token: JwtToken, config: &State<Config>) -> ApiResponseErr<FriendAddResponse> {
    let JwtToken { id: user_id, username } = token;

    verify_user!(sql, &user_id, true);

    let username_receiver = verify_user!(sql, &friend_user_id, false);


    if friend_user_id == user_id {
        return ApiResponseErr::api_err(Status::Conflict, String::from("Can not add yourself"));
    }

    if rjtry!(friend::sql::used_friend_slots(sql, &user_id).await) >= config.max_friends as i64 {
        return ApiResponseErr::api_err(Status::Conflict, format!("Reached friend limit of {}", config.max_friends));
    }

    if rjtry!(friend::sql::user_friend(sql, &user_id, &friend_user_id).await).is_some() {
        return ApiResponseErr::api_err(Status::Conflict, format!("Friend response already sent by or to {}", username_receiver));
    }

    rjtry!(sql::send_friend_request(sql, &user_id, &friend_user_id).await);

    rjtry!(notification::sql::add_notification(sql, &friend_user_id, None, &notification::data::NotificationCreateData {
        title: String::from("Friend Request"),
        message: format!("{} sent you a friend request, click to view!", username),
        url: format!("/user/{}/friends", friend_user_id),
        time: Utc::now()
    }).await);

    ApiResponseErr::ok(Status::Ok, FriendAddResponse { message: format!("Sent friend request to {}", username_receiver) })
}
