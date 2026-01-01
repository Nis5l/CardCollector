use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::State;
use rocket::http::Status;

use crate::sql::Sql;
use crate::{verify_collector, verify_user, verify_collector_owner_moderator};
use crate::shared::{Id, crypto::JwtToken, collector::CollectorSetting};
use super::data::{CollectorConfigResponse, CollectorConfigRequest};
use super::sql;

#[post("/collector/<collector_id>/config", data="<data>")]
pub async fn set_collector_config_route(collector_id: Id, data: CollectorConfigRequest, token: JwtToken, sql: &State<Sql>) -> ApiResponseErr<CollectorConfigResponse> {
    let user_id = token.id;

    verify_user!(&sql, &user_id, true);
    verify_collector!(&sql, &collector_id);
    verify_collector_owner_moderator!(&sql, &collector_id, &user_id);

    if let Some(pack_amount) = data.pack_amount {
        //rjtry!(sql::set_collector_setting(sql, &collector_id, CollectorSetting::PackAmount, &pack_amount.to_string()).await);
        sql::set_collector_setting(sql, &collector_id, CollectorSetting::PackAmount, &pack_amount.to_string()).await.unwrap();
    }
    if let Some(pack_cooldown) = data.pack_cooldown {
        rjtry!(sql::set_collector_setting(sql, &collector_id, CollectorSetting::PackCooldown, &pack_cooldown.to_string()).await);
    }
    if let Some(pack_quality_min) = data.pack_quality_min {
        rjtry!(sql::set_collector_setting(sql, &collector_id, CollectorSetting::PackQualityMin, &pack_quality_min.to_string()).await);
    }
    if let Some(pack_quality_max) = data.pack_quality_max {
        rjtry!(sql::set_collector_setting(sql, &collector_id, CollectorSetting::PackQualityMax, &pack_quality_max.to_string()).await);
    }

    ApiResponseErr::ok(Status::Ok, CollectorConfigResponse {
        message: String::from("Updated collector config")
    })
}
