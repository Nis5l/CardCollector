use rocketjson::ApiResponseErr;
use rocket::State;
use rocket::http::Status;

use crate::config::Config;
use super::data::{CollectorConfigResponse, FieldRange};

#[get("/collector/config")]
pub async fn get_collector_general_config_route(config: &State<Config>) -> ApiResponseErr<CollectorConfigResponse> {
    ApiResponseErr::ok(Status::Ok, CollectorConfigResponse {
        name: FieldRange {
            min: config.collector_len_min as i32,
            max: config.collector_len_max as i32,
        },
        description: FieldRange {
            min: config.collector_desciption_len_min as i32,
            max: config.collector_desciption_len_max as i32,
        },
        moderator_limit: config.collector_moderator_limit,
        pack_cooldown: FieldRange {
            min: config.pack_cooldown_min as i32,
            max: config.pack_cooldown_max as i32,
        },
        pack_amount: FieldRange {
            min: config.pack_amount_min as i32,
            max: config.pack_amount_max as i32,
        },
        pack_quality_min: FieldRange {
            min: config.pack_quality_min_min,
            max: config.pack_quality_min_max,
        },
        pack_quality_max: FieldRange {
            min: config.pack_quality_max_min,
            max: config.pack_quality_max_max,
        },
    })
}
