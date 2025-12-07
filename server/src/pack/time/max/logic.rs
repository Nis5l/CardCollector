use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::State;
use chrono::Duration;
use rocket::http::Status;

use crate::config::Config;
use crate::sql::Sql;
use crate::shared::Id;
use crate::shared::collector::{get_collector_setting, CollectorSetting};
use crate::verify_collector;
use super::data::PackTimeMaxResponse;

#[get("/pack/<collector_id>/time/max")]
pub async fn pack_time_max_route(collector_id: Id, config: &State<Config>, sql: &State<Sql>) -> ApiResponseErr<PackTimeMaxResponse> {
    verify_collector!(sql, &collector_id);

    let pack_time_max = rjtry!(get_collector_setting(sql, &collector_id, CollectorSetting::PackCooldown, config.pack_cooldown).await);

    let duration = Duration::seconds(pack_time_max as i64);

    return ApiResponseErr::ok(Status::Ok, PackTimeMaxResponse {
        pack_time_max: duration.to_string()
    })
}
