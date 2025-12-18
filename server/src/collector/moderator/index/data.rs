use serde::Serialize;

use crate::shared::user::data::User;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CollectorModeratorIndexResponse {
    pub moderators: Vec<User>,
}
