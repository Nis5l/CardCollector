use rocket::{State, http::Status};
use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};

use crate::sql::Sql;
use crate::config::Config;

use super::data::{CollectorIndexResponse, CollectorSortType};
use super::sql;

#[get("/collector?<search>&<page>&<sort_type>")]
pub async fn collector_index_route(sql: &State<Sql>, config: &State<Config>, sort_type: Option<i32>, search: Option<String>, page: Option<u32>) -> ApiResponseErr<CollectorIndexResponse> {
    let s = search.unwrap_or(String::from(""));
    let page = page.unwrap_or(0);
    let sort_type = CollectorSortType::from(sort_type);
    let collectors = rjtry!(sql::get_collectors(&sql, s.clone(), sort_type, config.collectors_page_amount, config.collectors_page_amount * page).await);
    let collector_count = rjtry!(sql::get_collectors_count(&sql, s).await);
    ApiResponseErr::ok(Status::Ok, CollectorIndexResponse {
        page,
        collector_count,
        page_size: config.collectors_page_amount,
        collectors
    })
}
