use rocket::{State, http::Status};
use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};

use crate::sql::Sql;
use crate::shared::Id;
use crate::verify_collector;

use super::data::CollectorModeratorIndexResponse;
use super::sql;

#[get("/collector/<collector_id>/moderator")]
pub async fn collector_moderator_index_route(sql: &State<Sql>, collector_id: Id) -> ApiResponseErr<CollectorModeratorIndexResponse> {
    verify_collector!(sql, &collector_id);

    let moderators = rjtry!(sql::get_collector_moderators(sql, &collector_id).await);

    ApiResponseErr::ok(Status::Ok, CollectorModeratorIndexResponse {
        moderators
    })
}
