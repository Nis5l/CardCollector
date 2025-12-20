use rocketjson::JsonBody;
use validator::Validate;
use serde::{Serialize, Deserialize};

use crate::shared::Id;

#[derive(Debug, Deserialize, Validate, JsonBody)]
#[serde(rename_all = "camelCase")]
pub struct CollectorRemoveModeratorRequest {
    pub user_id: Id,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CollectorRemoveModeratorResponse {
    pub message: String
}
