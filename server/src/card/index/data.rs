use serde::Serialize;

use crate::shared::card::data::Card;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CardIndexResponse {
    pub page_size: u32,
    pub page: u32,
    pub card_count: u32,
    pub cards: Vec<Card>,
}
