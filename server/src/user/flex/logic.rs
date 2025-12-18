use rocket::http::Status;
use rocket::State;
use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};

use crate::{verify_user, verify_collector};
use crate::sql::Sql;
use crate::shared::Id;
use crate::config::Config;
use crate::shared::{card, card::data::UnlockedCard};

#[get("/user/<user_id>/<collector_id>/flex")]
pub async fn flex_route(user_id: Id, collector_id: Id, sql: &State<Sql>, config: &State<Config>) -> ApiResponseErr<Vec<UnlockedCard>> {
    verify_user!(sql, &user_id, false);
    verify_collector!(sql, &collector_id);

    let cards = rjtry!(card::sql::get_inventory(sql, &card::data::InventoryOptions {
        user_id,
        collector_id,
        count: config.flex_cards_amount,
        exclude_uuids: Vec::new(),
        offset: 0,
        search: String::from(""),
        sort_type: card::data::SortType::Level,
        level: None,
        card_id: None
    }).await);

    ApiResponseErr::ok(Status::Ok, cards)
}
