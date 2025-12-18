use serde::Serialize;

use crate::shared::friend::data::FriendStatus;
use crate::shared::user::data::User;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FriendResponse {
    pub user: User,
    pub status: FriendStatus
}
