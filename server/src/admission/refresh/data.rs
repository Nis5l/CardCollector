use serde::{Serialize};
use sqlx::FromRow;

#[derive(Serialize)]
#[serde(rename_all="camelCase")]
pub struct RefreshResponse {
    pub access_token: String,
    pub role: i8
}

#[derive(Debug, FromRow)]
pub struct UserRoleDb {
    pub username: String,
    pub role: i8
}