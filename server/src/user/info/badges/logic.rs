use rocketjson::{ApiResponseErr, error::ApiErrorsCreate};
use rocket::http::Status;

use crate::shared::Id;
use crate::shared::user;
use crate::verify_user;
use crate::sql::Sql;
use rocket::State;
use super::data::UserBadgesResponse;

#[get("/user/<user_id>/badges")]
pub async fn user_badges_route(user_id: Id, sql: &State<Sql>) -> ApiResponseErr<UserBadgesResponse> {
    verify_user!(sql, &user_id, false);

    let badges = user::data::get_badges(&user_id);

    ApiResponseErr::ok(Status::Ok, UserBadgesResponse { badges })
}
