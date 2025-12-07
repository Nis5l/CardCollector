use serde::Serialize;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize)]
pub struct VerifyTimeResponse {
    pub time: DateTime<Utc>
}
