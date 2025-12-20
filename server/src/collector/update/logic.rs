use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::State;
use rocket::http::Status;

use crate::sql::Sql;
use crate::shared::crypto::JwtToken;
use crate::{verify_user, verify_collector, verify_collector_owner_moderator};
use super::data::{CollectorUpdateRequest, CollectorUpdateResponse};
use super::sql;

#[post("/collector/update", data="<data>")]
pub async fn update_collector_route(data: CollectorUpdateRequest, token: JwtToken, sql: &State<Sql>) -> ApiResponseErr<CollectorUpdateResponse> {
    let user_id = token.id;
    verify_user!(&sql, &user_id, true);
    let collector_id = data.id;
    verify_collector!(&sql, &collector_id);
    verify_collector_owner_moderator!(sql, &collector_id, &user_id);

    let collector_name = data.name;
    let collector_description = data.description;

    rjtry!(sql::update_collector(&sql, &collector_name, &collector_description, &collector_id).await);

    ApiResponseErr::ok(Status::Ok, CollectorUpdateResponse {
        message: String::from("collector updated")
    })
}
