use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::{State, http::Status};

use crate::sql::Sql;
use crate::config::Config;
use crate::shared::Id;
use crate::shared::card::data::CardState;
use super::sql;
use super::data::CardTypeIndexResponse;

#[get("/<collector_id>/card-type?<name>&<page>&<state>")]
pub async fn card_type_index_route(collector_id: Id, sql: &State<Sql>, name: Option<String>, page: Option<u32>, state: Option<CardState>, config: &State<Config>) -> ApiResponseErr<CardTypeIndexResponse> {
    let page = page.unwrap_or(0);
    let search = name.unwrap_or(String::from(""));
    let card_types = rjtry!(sql::get_card_types(&sql, &collector_id, search.clone(), config.card_type_page_amount, page * config.card_type_page_amount, state.clone()).await);
    let card_type_count = rjtry!(sql::get_card_type_count(&sql, &collector_id, search, state).await);

    ApiResponseErr::ok(Status::Ok, CardTypeIndexResponse {
        page,
        page_size: config.card_type_page_amount,
        card_type_count,
        card_types,
    })
}
