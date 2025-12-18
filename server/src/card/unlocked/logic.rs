use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::State;
use rocket::http::Status;

use crate::shared::card;
use crate::sql::Sql;
use crate::shared::Id;
use crate::shared::card::data::UnlockedCard;

#[get("/card/unlocked/<card_unlocked_id>")]
pub async fn card_unlocked_route(card_unlocked_id: Id, sql: &State<Sql>) -> ApiResponseErr<UnlockedCard> {
    let card_opt = rjtry!(card::sql::get_unlocked_card(sql, &card_unlocked_id, None).await);

    match card_opt {
        None => ApiResponseErr::api_err(Status::NotFound, format!("Unlocked card with id {} not found", card_unlocked_id)),
        Some(card) => ApiResponseErr::ok(Status::Ok, card)
    }
}
