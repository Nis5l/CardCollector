use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::{State, http::Status};

use crate::sql::Sql;
use crate::config::Config;
use crate::shared::Id;
use crate::shared::card::data::{CardState, CardTypeSortType};
use super::sql;
use super::data::CardTypeIndexResponse;

#[get("/<collector_id>/card-type?<name>&<page>&<state>&<sort_type>")]
pub async fn card_type_index_route(collector_id: Id, sql: &State<Sql>, name: Option<String>, page: Option<u32>, sort_type: Option<i32>, state: Option<i32>, config: &State<Config>) -> ApiResponseErr<CardTypeIndexResponse> {
    let page = page.unwrap_or(0);
    let search = name.unwrap_or(String::from(""));
    let sort_type = if let Some(st) = sort_type {
        CardTypeSortType::from(st)
    } else {
        CardTypeSortType::default()
    };
    let card_state = match state {
        Some(v) => Some(CardState::from(v)),
        None => None
    };

    let card_types = rjtry!(sql::get_card_types(&sql, &collector_id, search.clone(), &sort_type, config.card_type_page_amount, page * config.card_type_page_amount, card_state.clone()).await);
    let card_type_count = rjtry!(sql::get_card_type_count(&sql, &collector_id, search, card_state).await);

    ApiResponseErr::ok(Status::Ok, CardTypeIndexResponse {
        page,
        page_size: config.card_type_page_amount,
        card_type_count,
        card_types,
    })
}
