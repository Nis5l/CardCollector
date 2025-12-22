use rocketjson::{ ApiResponseErr, rjtry, error::ApiErrorsCreate };
use rocket::http::Status;
use rocket::State;

use crate::shared::crypto::JwtToken;
use crate::config::Config;
use crate::sql::Sql;
use crate::shared::Id;
use crate::shared::card;
use crate::verify_user;
use super::data::{CardRequestResponse, CardRequestRequest};
use super::sql;
use super::super::shared;

#[post("/card/request/update", data="<data>")]
pub async fn card_request_update_route(data: CardRequestRequest, token: JwtToken, config: &State<Config>, sql: &State<Sql>) -> ApiResponseErr<CardRequestResponse> {
    let user_id = &token.id;
    verify_user!(sql, user_id, true);

    if rjtry!(shared::sql::card_requests_user_count(sql, user_id).await) >= config.collector_card_request_limit as i32 {
        return ApiResponseErr::api_err(Status::Conflict, format!("Card request limit of {} reached", config.collector_card_request_limit))
    }

    //NOTE: required on top of get_card_collector_id for Created check
    if rjtry!(shared::sql::card_exists(sql, &data.name, &data.card_type, user_id).await) {
        return ApiResponseErr::api_err(Status::Conflict, String::from("Card already exists"))
    }

    let card_collector_id = rjtry!(card::sql::get_card_collector_id(sql, &data.card_id).await);
    let collector_id = rjtry!(card::sql::get_card_type_collector_id(sql, &data.card_type).await);

    if card_collector_id != collector_id {
        return ApiResponseErr::api_err(Status::Conflict, String::from("Card-Type collector does not match Card collector"))
    }

    //NOTE: required on top of get_card_type_collector_id for Created check
    if !rjtry!(card::sql::card_type_exists_created(sql, &collector_id, &data.card_type).await) {
        return ApiResponseErr::api_err(Status::Conflict, String::from("Card-Type does not exist"))
    }

    let card_id = Id::new(config.id_length);
    rjtry!(sql::create_card_update_request(sql, &card_id, &data.name, &data.card_type, user_id, &data.card_id).await);

    ApiResponseErr::ok(Status::Ok, CardRequestResponse { id: card_id })
}
