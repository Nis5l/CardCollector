use rocketjson::JsonBody;
use validator::Validate;
use serde::{Serialize, Deserialize};

use crate::shared::Id;
use crate::shared::friend::data::FriendStatus;

#[derive(Debug, Serialize)]
#[serde(rename_all="camelCase")]
pub struct FriendStatusResponse {
    pub status: FriendStatus
}
