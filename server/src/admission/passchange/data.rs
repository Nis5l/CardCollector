use serde::{Serialize, Deserialize};
use rocketjson::JsonBody;
use validator::{Validate, ValidateArgs};

use crate::config;
use crate::shared::user::data::validate_password;

#[derive(Debug, Deserialize, Validate, JsonBody)]
#[serde(rename_all="camelCase")]
#[validate(context = config::Config)]
pub struct PassChangeRequest {
    #[validate(custom(function="validate_password", use_context))]
    pub new_password: String
}

#[derive(Debug, Serialize)]
pub struct PassChangeResponse {
    pub message: String
}
