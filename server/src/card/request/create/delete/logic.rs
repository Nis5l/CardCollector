use rocketjson::{ ApiResponseErr, rjtry, error::ApiErrorsCreate };
use rocket::http::Status;
use rocket::State;

use crate::shared::crypto::JwtToken;
use crate::config::Config;
use crate::sql::Sql;
use crate::shared::Id;
use crate::shared::card;
use crate::verify_user;
use super::data::{CardDeleteRequest, CardDeleteResponse};
use super::sql;
use super::super::shared;

#[post("/card/request/delete", data="<data>")]
pub async fn card_request_delete_route(data: CardDeleteRequest, token: JwtToken, config: &State<Config>, sql: &State<Sql>) -> ApiResponseErr<CardDeleteResponse> {
    let user_id = &token.id;
    verify_user!(sql, user_id, true);

    if rjtry!(shared::sql::card_requests_user_count(sql, user_id).await) >= config.collector_card_request_limit as i32 {
        return ApiResponseErr::api_err(Status::Conflict, format!("Card request limit of {} reached", config.collector_card_request_limit))
    }

    //NOTE: fails if card does not exist
    rjtry!(card::sql::get_card_collector_id(sql, &data.card_id).await);

    let card_delete_id = Id::new(config.id_length);
    rjtry!(sql::create_card_delete_request(sql, &card_delete_id, &data.card_id, user_id).await);

    ApiResponseErr::ok(Status::Ok, CardDeleteResponse { id: card_delete_id })
}
