use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::{State, http::Status};

use crate::sql::Sql;
use crate::shared::Id;
use crate::shared::collector;
use crate::{verify_user, verify_collector};
use super::data::CollectorIsOwnerResponse;

#[get("/user/<user_id>/<collector_id>/is-owner")]
pub async fn user_collector_is_owner_route(sql: &State<Sql>, user_id: Id, collector_id: Id) -> ApiResponseErr<CollectorIsOwnerResponse> {
    verify_user!(sql, &user_id, true);
    verify_collector!(sql, &collector_id);

    let is_owner = rjtry!(collector::sql::collector_is_owner(sql, &collector_id, &user_id).await);

    ApiResponseErr::ok(Status::Ok, CollectorIsOwnerResponse { is_owner })
}
