use serde::{Serialize, Deserialize};
use rocketjson::JsonBody;
use validator::{Validate, ValidateArgs};
use crate::shared::user::data::validate_password;
use crate::config::Config;

#[derive(Debug, Serialize)]
pub struct ForgotResetResponse {
    pub message: String
}

#[derive(Debug, Deserialize, Validate, JsonBody)]
#[validate(context = Config)]
#[serde(rename_all="camelCase")]
pub struct ForgotResetRequest {
    pub key: String,
    #[validate(custom(function="validate_password", use_context))]
    pub password: String,
}
