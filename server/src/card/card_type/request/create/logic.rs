use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::State;
use rocket::http::Status;

use super::sql;
use super::data::{CardTypeRequestCreateRequest, CardTypeRequestCreateResponse};
use crate::shared::Id;
use crate::config::Config;
use crate::sql::Sql;
use crate::{verify_collector, verify_user};
use crate::shared::crypto::JwtToken;

#[post("/<collector_id>/card-type/request", data="<data>")]
pub async fn card_type_request_create_route(collector_id: Id, config: &State<Config>, sql: &State<Sql>, data: CardTypeRequestCreateRequest, token: JwtToken) -> ApiResponseErr<CardTypeRequestCreateResponse> {
    let user_id = &token.id;
    verify_collector!(sql, &collector_id);
    verify_user!(sql, user_id, true);

    if rjtry!(sql::collector_type_exists(sql, &collector_id, user_id, &data.name).await) {
        return ApiResponseErr::api_err(Status::Conflict, String::from("Card-Type already exists"))
    }

    let card_type_id = Id::new(config.id_length);
    rjtry!(sql::collector_type_request_create(sql, &card_type_id, &collector_id, user_id, &data.name).await);

    ApiResponseErr::ok(Status::Ok, CardTypeRequestCreateResponse { id: card_type_id })
}
