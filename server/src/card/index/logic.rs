use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::{State, http::Status};

use crate::sql::Sql;
use crate::config::Config;
use crate::shared::Id;
use crate::shared::card::data::CardState;
use crate::shared::{card, card::data::CardSortType};
use super::sql;
use super::data::CardIndexResponse;

#[get("/<collector_id>/card?<search>&<page>&<state>&<sort_type>")]
pub async fn card_index_route(collector_id: Id, sql: &State<Sql>, search: Option<String>, page: Option<u32>, state: Option<CardState>, sort_type: Option<i32>, config: &State<Config>) -> ApiResponseErr<CardIndexResponse> {
    let page = page.unwrap_or(0);
    let search = search.unwrap_or(String::from(""));
    let sort_type = if let Some(st) = sort_type {
        CardSortType::from(st)
    } else {
        CardSortType::default()
    };

    let cards = rjtry!(card::sql::get_cards(&sql, &collector_id, search.clone(), &sort_type, config.card_type_page_amount, page * config.card_type_page_amount, state.clone()).await);
    let card_count = rjtry!(sql::get_card_count(&sql, &collector_id, search, state).await);

    ApiResponseErr::ok(Status::Ok, CardIndexResponse {
        page,
        page_size: config.card_type_page_amount,
        card_count,
        cards,
    })
}
