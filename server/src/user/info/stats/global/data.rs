use serde::Serialize;
use crate::shared::collector::Collector;
use super::super::shared::Achievement;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UserStatsGlobalResponse {
    pub username: String,
    pub max_friends: u32,
    pub friends: i64,

    pub collector_favorites: Vec<Collector>,

    pub achievements: Vec<Achievement>
}
