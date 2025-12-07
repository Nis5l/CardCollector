use serde::Serialize;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize)]
pub struct VerifyResendResponse {
    pub message: String
}

pub enum CanResendVerification {
    Yes,
    No(DateTime<Utc>)
}
