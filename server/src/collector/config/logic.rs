use rocketjson::ApiResponseErr;
use rocket::State;
use rocket::http::Status;

use crate::config::Config;
use super::data::{CollectorConfigResponse, FieldRange};

#[get("/collector/config")]
pub async fn get_collector_config_route(config: &State<Config>) -> ApiResponseErr<CollectorConfigResponse> {
    ApiResponseErr::ok(Status::Ok, CollectorConfigResponse {
        name: FieldRange {
            min_length: config.collector_len_min,
            max_length: config.collector_len_max
        },
        description: FieldRange {
            min_length: config.collector_desciption_len_min,
            max_length: config.collector_desciption_len_max,
        },
        moderator_limit: config.collector_moderator_limit
    })
}
