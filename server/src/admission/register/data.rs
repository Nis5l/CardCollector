use serde::{Serialize, Deserialize};
use validator::{ValidationError, Validate, ValidateArgs};
use rocketjson::JsonBody;
use regex::Regex;
use std::borrow::Cow;

use crate::config;
use crate::shared::user::data::validate_password;

#[derive(Debug, Deserialize, Validate, JsonBody)]
#[validate(context = config::Config)]
pub struct RegisterRequest {
    #[validate(custom(function="validate_username", use_context))]
    pub username: String,
    #[validate(custom(function="validate_password", use_context))]
    pub password: String,

    #[validate(email)]
    pub email: String
}

#[derive(Serialize)]
pub struct RegisterResponse {
    message: String
}

impl RegisterResponse {
    pub fn new(message: String) -> Self {
        RegisterResponse { message }
    }
}

fn validate_username(username: &str, config: &config::Config) -> Result<(), ValidationError> {
	if username.len() < config.username_len_min as usize || username.len() > config.username_len_max as usize {
        let mut err = ValidationError::new("username does not fit the length constraints");
        err.add_param(Cow::from("min"), &config.username_len_min);
        err.add_param(Cow::from("max"), &config.username_len_max);

        return Err(err);
    }
    let re = Regex::new("^[a-zA-Z0-9_]+$").unwrap();

    if !re.is_match(username) {
        return Err(ValidationError::new("user can only contain letters, numbers and _"));
    }

    Ok(())
}
