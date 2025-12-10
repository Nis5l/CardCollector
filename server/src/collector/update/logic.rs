use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::State;
use rocket::http::Status;

use crate::sql::Sql;
use crate::shared::crypto::JwtToken;
use crate::verify_user;
use super::data::{CollectorUpdateRequest, CollectorUpdateResponse};
use super::sql;

#[post("/collector/update", data="<data>")]
pub async fn update_collector_route(data: CollectorUpdateRequest, token: JwtToken, sql: &State<Sql>) -> ApiResponseErr<CollectorUpdateResponse> {
    let user_id = token.id;
    verify_user!(&sql, &user_id, true);

    let collector_id = data.id;
    let collector_name = data.name;
    let collector_description = data.description;

    if !rjtry!(sql::is_collector_owner(&sql, &collector_id, &user_id).await) {
        return ApiResponseErr::api_err(Status::Conflict, String::from("Not Collector Owner"));
    }

    rjtry!(sql::update_collector(&sql, &collector_name, &collector_description, &collector_id).await);

    ApiResponseErr::ok(Status::Ok, CollectorUpdateResponse {
        message: String::from("collector updated")
    })
}
