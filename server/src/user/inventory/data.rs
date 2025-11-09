use serde::{Deserialize, Serialize};
use rocketjson::JsonBody;
use validator::Validate;

use crate::shared::Id;
use crate::shared::card::data::{SortType, UnlockedCard};

#[derive(Debug, Deserialize, Validate, JsonBody)]
#[serde(rename_all = "camelCase")]
pub struct InventoryFriendRequest {
    pub friend_id: Id,
    #[serde(default)]
    pub exclude_suggestions: bool,
}

#[derive(Debug, Deserialize, Validate, JsonBody)]
#[serde(rename_all = "camelCase")]
pub struct InventoryRequest {
    #[serde(default)]
    pub page: u32,
    #[serde(default)]
    pub search: String,
    #[serde(default)]
    pub exclude_uuids: Vec<Id>,
    #[serde(default)]
    pub sort_type: SortType,
    pub level: Option<i32>,
    pub card_id: Option<Id>,
    pub friend: Option<InventoryFriendRequest>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct InventoryResponse {
    pub page_size: u32,
    pub page: u32,
    pub card_count: u32,
    pub cards: Vec<UnlockedCard>,
}
