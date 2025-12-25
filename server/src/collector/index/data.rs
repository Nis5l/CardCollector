use serde::{Serialize, Deserialize};
use serde_repr::Serialize_repr;
use rocket::form::FromFormField;

use crate::shared::collector::Collector;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CollectorIndexResponse {
    pub page_size: u32,
    pub page: u32,
    pub collector_count: u32,
    pub collectors: Vec<Collector>,
}

#[derive(Debug, FromFormField, Serialize_repr)]
#[repr(i32)]
pub enum CollectorSortType {
    Name = 0,
    Recent = 1,
    MostCards = 2,
    MostUsers = 3
}

impl Default for CollectorSortType {
    fn default() -> Self {
        Self::Name
    }
}

impl From<i32> for CollectorSortType {
    fn from(value: i32) -> Self {
        match value {
            1 => Self::Recent,
            2 => Self::MostCards,
            3 => Self::MostUsers,
            _ => Self::Name
        }
    }
}

impl From<Option<i32>> for CollectorSortType {
    fn from(value: Option<i32>) -> Self {
        match value {
            Some(1) => Self::Recent,
            Some(2) => Self::MostCards,
            Some(3) => Self::MostUsers,
            _ => Self::Name
        }
    }
}

impl<'de> Deserialize<'de> for CollectorSortType {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
       where D: serde::Deserializer<'de> {
            let i = i32::deserialize(deserializer)?;

            Ok(Self::from(i))
       }
}
