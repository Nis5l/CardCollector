use serde::Serialize;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize)]
pub struct PackStatsPair {
    pub time: DateTime<Utc>,
    pub amount: i32
}
