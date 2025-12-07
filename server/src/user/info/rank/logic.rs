use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::http::Status;
use rocket::State;

use crate::sql::Sql;
use crate::shared::Id;
use crate::verify_user;
use super::data::UserRankResponse;
use super::sql;

#[get("/user/<user_id>/rank")]
pub async fn user_rank_route(user_id: Id, sql: &State<Sql>) -> ApiResponseErr<super::data::UserRankResponse> {
    verify_user!(sql, &user_id, false);
    let rank = rjtry!(sql::get_user_ranking(sql, user_id).await);

    ApiResponseErr::ok(Status::Ok, UserRankResponse { rank })
}
