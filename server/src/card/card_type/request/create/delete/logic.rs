use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::State;
use rocket::http::Status;

use super::sql;
use super::data::{CardTypeDeleteRequest, CardTypeDeleteResponse};
use super::super::shared;
use crate::shared::{card, Id};
use crate::config::Config;
use crate::sql::Sql;
use crate::{verify_collector, verify_user};
use crate::shared::crypto::JwtToken;

#[post("/<collector_id>/card-type/request/delete", data="<data>")]
pub async fn card_type_request_delete_route(collector_id: Id, config: &State<Config>, sql: &State<Sql>, data: CardTypeDeleteRequest, token: JwtToken) -> ApiResponseErr<CardTypeDeleteResponse> {
    let user_id = &token.id;
    verify_collector!(sql, &collector_id);
    verify_user!(sql, user_id, true);

    if rjtry!(shared::sql::card_type_requests_user_count(sql, user_id).await) >= config.collector_card_type_request_limit as i32 {
        return ApiResponseErr::api_err(Status::Conflict, format!("Card type request limit of {} reached", config.collector_card_type_request_limit))
    }

    if !rjtry!(card::sql::card_type_exists_created(sql, &collector_id, &data.card_type_id).await) {
        return ApiResponseErr::api_err(Status::Conflict, String::from("Referenced Card-Type does not exists"))
    }

    let delete_card_type_id = Id::new(config.id_length);
    rjtry!(sql::card_type_delete_request_create(sql, &delete_card_type_id, &data.card_type_id, user_id).await);

    ApiResponseErr::ok(Status::Ok, CardTypeDeleteResponse { id: delete_card_type_id })
}
