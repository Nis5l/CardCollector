use serde::Serialize;

use crate::shared::user::data::User;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UsersResponse {
    pub users: Vec<User>,
    pub page_size: u32,
    pub page: u32,
    pub user_count: u32,
}
