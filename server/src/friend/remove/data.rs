use serde::{Serialize, Deserialize};
use validator::Validate;
use rocketjson::JsonBody;

use crate::shared::Id;

#[derive(Debug, Serialize)]
pub struct FriendRemoveResponse {
    pub message: String
}
