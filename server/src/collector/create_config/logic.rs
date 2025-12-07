use rocketjson::ApiResponseErr;
use rocket::State;
use rocket::http::Status;

use crate::config::Config;
use super::data::CollectorCreateConfigResponse;

#[get("/collector/create-config")]
pub async fn get_create_config_collector_route(config: &State<Config>) -> ApiResponseErr<CollectorCreateConfigResponse> {
    ApiResponseErr::ok(Status::Ok, CollectorCreateConfigResponse {
        min_length: config.collector_len_min,
        max_length: config.collector_len_max
    })
}
