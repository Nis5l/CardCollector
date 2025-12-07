use rocketjson::ApiResponseErr;
use rocket::State;
use rocket::http::Status;

use super::data::CardTypeConfigResponse;
use crate::config::Config;

#[get("/card-type/config")]
pub async fn card_type_config_route(config: &State<Config>) -> ApiResponseErr<CardTypeConfigResponse> {
    ApiResponseErr::ok(Status::Ok, CardTypeConfigResponse {
        name_length_max: config.card_type_len_max,
        name_length_min: config.card_type_len_min,
    })
}
