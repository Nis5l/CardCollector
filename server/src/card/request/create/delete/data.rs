use serde::{Serialize, Deserialize};
use rocketjson::JsonBody;
use validator::Validate;

use crate::shared::Id;

#[derive(Debug, Deserialize, Validate, JsonBody)]
#[serde(rename_all="camelCase")]
pub struct CardDeleteRequest {
    pub card_id: Id,
}

#[derive(Debug, Serialize)]
pub struct CardDeleteResponse {
    pub id: Id,
}
