use serde::Serialize;

use crate::shared::card::data::CardType;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CardTypeIndexResponse {
    pub page_size: u32,
    pub page: u32,
    pub card_type_count: u32,
    pub card_types: Vec<CardType>,
}
