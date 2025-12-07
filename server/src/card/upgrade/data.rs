use serde::{Serialize, Deserialize};
use rocketjson::JsonBody;
use validator::Validate;

use crate::shared::card::data::UnlockedCardCreateData;
use crate::shared::Id;

#[derive(Debug, Serialize)]
pub struct UpgradeResponse {
    pub card: Id,
    pub success: bool
}

#[derive(Debug, Serialize, Deserialize, Validate, JsonBody)]
#[serde(rename_all="camelCase")]
pub struct UpgradeRequest {
    pub card_one: Id,
    pub card_two: Id
}

pub struct UpgradeCardsResult {
    pub success: bool,
    pub create_card_data: UnlockedCardCreateData
}

