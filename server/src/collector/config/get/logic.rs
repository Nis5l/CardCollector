use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::State;
use rocket::http::Status;

use crate::sql::Sql;
use crate::config::Config;
use crate::verify_collector;
use super::data::CollectorConfigResponse;
use crate::shared::{Id, collector, collector::CollectorSetting};

#[get("/collector/<collector_id>/config")]
pub async fn get_collector_config_route(collector_id: Id, sql: &State<Sql>, config: &State<Config>) -> ApiResponseErr<CollectorConfigResponse> {
    verify_collector!(&sql, &collector_id);

    let pack_amount = rjtry!(collector::get_collector_setting(sql, &collector_id, CollectorSetting::PackAmount, config.pack_amount).await);
    let pack_cooldown = rjtry!(collector::get_collector_setting(sql, &collector_id, CollectorSetting::PackCooldown, config.pack_cooldown).await);
    let pack_quality_min = rjtry!(collector::get_collector_setting(sql, &collector_id, CollectorSetting::PackQualityMin, config.pack_quality_min).await);
    let pack_quality_max = rjtry!(collector::get_collector_setting(sql, &collector_id, CollectorSetting::PackQualityMax, config.pack_quality_max).await);

    ApiResponseErr::ok(Status::Ok, CollectorConfigResponse {
        pack_amount,
        pack_cooldown,
        pack_quality_min,
        pack_quality_max ,
    })
}
