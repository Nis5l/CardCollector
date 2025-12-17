use serde::{Serialize, Deserialize};
use rocketjson::JsonBody;
use validator::Validate;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize)]
pub struct ForgotSendResponse {
    pub message: String
}

#[derive(Debug, Deserialize, Validate, JsonBody)]
#[serde(rename_all="camelCase")]
pub struct ForgotSendRequest {
    pub username_or_email: String
}

pub enum CanResendForgot {
    Yes,
    No(DateTime<Utc>)
}
