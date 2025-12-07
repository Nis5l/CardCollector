use serde::Serialize;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize)]
pub struct TradeConfirmReponse {
    pub message: String
}

pub enum TradeTimeOver {
    Yes,
    No(DateTime<Utc>),
}
