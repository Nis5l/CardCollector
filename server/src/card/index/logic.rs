use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::{State, http::Status};

use crate::sql::Sql;
use crate::config::Config;
use crate::shared::Id;
use crate::shared::card::data::CardState;
use crate::shared::card;
use super::sql;
use super::data::CardIndexResponse;

#[get("/<collector_id>/card?<name>&<page>&<state>")]
pub async fn card_index_route(collector_id: Id, sql: &State<Sql>, name: Option<String>, page: Option<u32>, state: Option<CardState>, config: &State<Config>) -> ApiResponseErr<CardIndexResponse> {
    let page = page.unwrap_or(0);
    let search = name.unwrap_or(String::from(""));
    let cards = rjtry!(card::sql::get_cards(&sql, &config, &collector_id, search.clone(), config.card_type_page_amount, page * config.card_type_page_amount, state.clone()).await);
    let card_count = rjtry!(sql::get_card_count(&sql, &collector_id, search, state).await);

    ApiResponseErr::ok(Status::Ok, CardIndexResponse {
        page,
        page_size: config.card_type_page_amount,
        card_count,
        cards,
    })
}
