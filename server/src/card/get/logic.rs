use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::State;
use rocket::http::Status;

use crate::shared::card;
use crate::sql::Sql;
use crate::shared::Id;
use crate::shared::card::data::Card;

#[get("/card/<card_id>")]
pub async fn card_route(card_id: Id, sql: &State<Sql>) -> ApiResponseErr<Card> {
    let collector_id = rjtry!(card::sql::get_card_collector_id(sql, &card_id).await);
    let card_opt = rjtry!(card::sql::get_card(sql, Some(&collector_id), &card_id).await);

    match card_opt {
        None => ApiResponseErr::api_err(Status::NotFound, format!("Card with id {} not found", card_id)),
        Some(card) => ApiResponseErr::ok(Status::Ok, card)
    }
}
