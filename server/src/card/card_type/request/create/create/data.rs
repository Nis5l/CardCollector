use serde::{Serialize, Deserialize};
use rocketjson::JsonBody;
use validator::{Validate, ValidationError, ValidateArgs};
use std::borrow::Cow;
use regex::Regex;

use crate::config;
use crate::shared::Id;

#[derive(Debug, Deserialize, Validate, JsonBody)]
#[validate(context = config::Config)]
pub struct CardTypeRequestCreateRequest {
    #[validate(custom(function="validate_collector_type_name", use_context))]
    pub name: String
}

#[derive(Debug, Serialize)]
pub struct CardTypeRequestCreateResponse {
    pub id: Id
}

fn validate_collector_type_name(name: &str, config: &config::Config) -> Result<(), ValidationError> {
    if name.len() < config.card_type_len_min as usize || name.len() > config.card_type_len_max as usize {
        let mut err = ValidationError::new("card-type name does not fit the length constraints");
        err.add_param(Cow::from("min"), &config.card_type_len_min);
        err.add_param(Cow::from("max"), &config.card_type_len_max);

        return Err(err);
    }
    let re = Regex::new("^[a-zA-Z0-9_]+( [a-zA-Z0-9_]+)*$").unwrap();

    if !re.is_match(name) {
        return Err(ValidationError::new("card-type can only contain letters, numbers, _ and whitespaces in between words"));
    }

    Ok(())
}
