use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::http::Status;
use rocket::State;

use crate::shared::card::packstats::{data::PackStatsPair, get_pack_stats};
use crate::shared::Id;
use crate::sql::Sql;
use crate::config::Config;
use crate::verify_collector;

#[get("/pack/<collector_id>/stats")]
pub async fn pack_stats_route(collector_id: Id, sql: &State<Sql>, config: &State<Config>) -> ApiResponseErr<Vec<PackStatsPair>> {
    verify_collector!(sql, &collector_id);

    let pack_stats = rjtry!(get_pack_stats(sql, &collector_id, config.pack_data_span, config.pack_data_amount).await);

    ApiResponseErr::ok(Status::Ok, pack_stats)
}
