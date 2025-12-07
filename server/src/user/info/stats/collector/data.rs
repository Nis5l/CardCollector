use serde::Serialize;
use super::super::shared::Achievement;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UserStatsCollectorResponse {
    pub max_friends: u32,
    pub friends: i64,

    pub max_cards: i64,
    pub cards: i64,

    pub max_trades: u32,
    pub trades: i64,

    pub achievements: Vec<Achievement>
}
