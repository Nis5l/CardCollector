use rocketjson::{ApiResponseErr, error::ApiErrorsCreate};
use rocket::{State, http::Status};

use crate::sql::Sql;
use crate::verify_user;
use crate::shared::Id;
use super::data::UserUsernameResponse;

#[get("/user/<user_id>/username")]
pub async fn user_username_route(user_id: Id, sql: &State<Sql>) -> ApiResponseErr<UserUsernameResponse> {
    let username = verify_user!(sql, &user_id, false);

    ApiResponseErr::ok(Status::Ok, UserUsernameResponse { username })
}
