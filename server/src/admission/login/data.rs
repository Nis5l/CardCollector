use serde::{Serialize, Deserialize};
use validator::Validate;
use rocketjson::JsonBody;
use sqlx::FromRow;

use crate::shared::Id;

#[derive(Debug, Deserialize, Validate, JsonBody)]
pub struct LoginRequest {
    pub username: String,
    pub password: String
}

#[derive(Serialize)]
#[serde(rename_all="camelCase")]
pub struct LoginResponse {
    pub access_token: String,
    pub user_id: Id,
    pub username: String,
    pub role: i8
}

#[derive(Debug, FromRow)]
pub struct LoginDb {
    pub id: Id,
    pub username: String,
    pub password: String,
    pub role: i8
}