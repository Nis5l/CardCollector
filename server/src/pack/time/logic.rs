use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::State;
use rocket::http::Status;

use super::data::PackTimeResponse;
use super::super::shared;
use crate::shared::crypto::JwtToken;
use crate::sql::Sql;
use crate::config::Config;
use crate::shared::{Id, util};
use crate::{verify_user, verify_collector};
use crate::shared::collector::{get_collector_setting, CollectorSetting};

#[get("/pack/<collector_id>/time")]
pub async fn pack_time_route(sql: &State<Sql>, collector_id: Id, token: JwtToken, config: &State<Config>) -> ApiResponseErr<PackTimeResponse> {
    let user_id = token.id;

    verify_user!(sql, &user_id, true);
    verify_collector!(sql, &collector_id);

    let last_opened = rjtry!(shared::sql::get_pack_time(sql, &user_id, &collector_id).await);

    let pack_time_max = rjtry!(get_collector_setting(sql, &collector_id, CollectorSetting::PackCooldown, config.pack_cooldown).await);
    let pack_time = util::time_from_db(last_opened, pack_time_max);

    return ApiResponseErr::ok(Status::Ok, PackTimeResponse {
        pack_time
    })
}
