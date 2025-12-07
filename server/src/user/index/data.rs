use serde::Serialize;

use crate::shared::Id;
use crate::shared::user::data::Badge;

#[derive(Serialize)]
pub struct UserResponse {
    pub id: Id,
    pub username: String,
    pub badges: Vec<Badge>
}

#[derive(Serialize)]
pub struct UsersResponse {
    pub users: Vec<UserResponse>,
    pub page_size: u32,
    pub page: u32,
    pub user_count: u32,
}
