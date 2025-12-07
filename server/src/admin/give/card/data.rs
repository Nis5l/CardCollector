use serde::{Serialize, Deserialize};
use rocketjson::JsonBody;
use validator::Validate;

use crate::shared::{Id, IdInt};

#[derive(Debug, Deserialize, Validate, JsonBody)]
#[serde(rename_all="camelCase")]
pub struct GiveCardRequest {
    pub user_id: Id,
    pub card_id: Id,
    pub frame_id: Option<IdInt>,
    pub quality: i32,
    pub level: i32
}

#[derive(Debug, Serialize)]
pub struct GiveCardResponse {
    pub uuid: Id
}
