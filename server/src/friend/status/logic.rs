use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::http::Status;
use rocket::State;

use super::data::FriendStatusResponse;
use crate::shared::{friend, Id};
use crate::sql::Sql;
use crate::shared::crypto::JwtToken;
use crate::verify_user;
use crate::shared::friend::data::FriendStatus;

#[get("/friend/<friend_user_id>/status")]
pub async fn friend_status_route(sql: &State<Sql>, friend_user_id: Id, token: JwtToken) -> ApiResponseErr<FriendStatusResponse> {
    let JwtToken { id: user_id, .. } = token;

    verify_user!(sql, &user_id, true);
    verify_user!(sql, &friend_user_id, false);

    let status = match rjtry!(friend::sql::user_friend(sql, &user_id, &friend_user_id).await) {
        Some(friend_db) => {
            match friend::data::FriendStatus::from_database(&user_id, &friend_db) {
                Some(status) => status,
                None => return ApiResponseErr::api_err(Status::NotFound, String::from("Internal server error"))
            }
        }
        None => FriendStatus::Nothing
    };

    ApiResponseErr::ok(Status::Ok, FriendStatusResponse { status })
}
