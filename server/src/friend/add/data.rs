use rocketjson::JsonBody;
use validator::Validate;
use serde::{Serialize, Deserialize};

use crate::shared::Id;

#[derive(Debug, Serialize)]
pub struct FriendAddResponse {
    pub message: String
}
