use rocket::{State, http::Status};
use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};

use crate::sql::Sql;
use crate::shared::collector::Collector;
use crate::shared::Id;

use super::sql;

#[get("/collector/<collector_id>")]
pub async fn collector_get_route(collector_id: Id, sql: &State<Sql>) -> ApiResponseErr<Collector> {
    match rjtry!(sql::get_collector(&sql, &collector_id).await) {
        Some(collector) => ApiResponseErr::ok(Status::Ok, collector),
        None => ApiResponseErr::api_err(Status::NotFound, String::from("Collector not found"))
    }
}
