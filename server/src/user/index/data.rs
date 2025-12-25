use serde::{Serialize, Deserialize};
use serde_repr::Serialize_repr;
use rocket::form::FromFormField;

use crate::shared::user::data::User;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UsersResponse {
    pub users: Vec<User>,
    pub page_size: u32,
    pub page: u32,
    pub user_count: u32,
}

#[derive(Debug, FromFormField, Serialize_repr)]
#[repr(i32)]
pub enum UserSortType {
    Name = 0,
    Recent = 1,
    MostCards = 2
}

impl Default for UserSortType {
    fn default() -> Self {
        Self::Name
    }
}

impl From<i32> for UserSortType {
    fn from(value: i32) -> Self {
        match value {
            1 => Self::Recent,
            2 => Self::MostCards,
            _ => Self::Name
        }
    }
}

impl From<Option<i32>> for UserSortType {
    fn from(value: Option<i32>) -> Self {
        match value {
            Some(1) => Self::Recent,
            Some(2) => Self::MostCards,
            _ => Self::Name
        }
    }
}

impl<'de> Deserialize<'de> for UserSortType {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
       where D: serde::Deserializer<'de> {
            let i = i32::deserialize(deserializer)?;

            Ok(Self::from(i))
       }
}
