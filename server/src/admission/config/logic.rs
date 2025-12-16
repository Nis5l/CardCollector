use rocketjson::ApiResponseErr;
use rocket::http::Status;

use super::data::{AdmissionConfigResponse, AdmissionConfigFieldRange};
use crate::config::Config;

#[get("/admission/config")]
pub async fn admission_config_route(config: &rocket::State<Config>) -> ApiResponseErr<AdmissionConfigResponse> {
    ApiResponseErr::ok(Status::Ok, AdmissionConfigResponse {
        username: AdmissionConfigFieldRange {
            min_length: config.username_len_min,
            max_length: config.username_len_max,
        },
        password: AdmissionConfigFieldRange {
            min_length: config.password_len_min,
            max_length: config.password_len_max,
        }
    })
}
