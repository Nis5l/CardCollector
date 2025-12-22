use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::State;
use rocket::http::Status;

use super::sql;
use super::data::{CardTypeRequestUpdateRequest, CardTypeRequestUpdateResponse};
use super::super::shared;
use crate::shared::{card, Id};
use crate::config::Config;
use crate::sql::Sql;
use crate::{verify_collector, verify_user};
use crate::shared::crypto::JwtToken;

#[post("/<collector_id>/card-type/request/update", data="<data>")]
pub async fn card_type_request_update_route(collector_id: Id, config: &State<Config>, sql: &State<Sql>, data: CardTypeRequestUpdateRequest, token: JwtToken) -> ApiResponseErr<CardTypeRequestUpdateResponse> {
    let user_id = &token.id;
    verify_collector!(sql, &collector_id);
    verify_user!(sql, user_id, true);

    if rjtry!(shared::sql::card_type_requests_user_count(sql, user_id).await) >= config.collector_card_type_request_limit as i32 {
        return ApiResponseErr::api_err(Status::Conflict, format!("Card type request limit of {} reached", config.collector_card_type_request_limit))
    }

    if rjtry!(shared::sql::card_type_exists(sql, &collector_id, user_id, &data.name).await) {
        return ApiResponseErr::api_err(Status::Conflict, String::from("Card-Type already exists"))
    }

    if !rjtry!(card::sql::card_type_exists_created(sql, &collector_id, &data.card_type_id).await) {
        return ApiResponseErr::api_err(Status::Conflict, String::from("Referenced Card-Type does not exists"))
    }

    let card_type_id = Id::new(config.id_length);
    rjtry!(sql::card_type_update_request_create(sql, &card_type_id, &collector_id, user_id, &data.name, &data.card_type_id).await);

    ApiResponseErr::ok(Status::Ok, CardTypeRequestUpdateResponse { id: card_type_id })
}
