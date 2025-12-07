use rocketjson::ApiResponseErr;
use rocket::State;
use rocket::http::Status;

use super::data::CardConfigResponse;
use crate::config::Config;

#[get("/card/config")]
pub async fn card_config_route(config: &State<Config>) -> ApiResponseErr<CardConfigResponse> {
    ApiResponseErr::ok(Status::Ok, CardConfigResponse {
        name_length_max: config.card_name_len_max,
        name_length_min: config.card_name_len_min,
    })
}
