use rocketjson::JsonBody;
use validator::{Validate, ValidationError, ValidateArgs};
use serde::{Serialize, Deserialize};
use std::borrow::Cow;
use regex::Regex;

use crate::shared::Id;
use crate::config;

#[derive(Debug, Deserialize, Validate, JsonBody)]
#[validate(context = config::Config)]
pub struct CollectorCreateRequest {
    #[validate(custom(function="validate_collector_name", use_context))]
    pub name: String
}

#[derive(Debug, Serialize)]
pub struct CollectorCreateResponse {
    pub id: Id
}

fn validate_collector_name(name: &str, config: &config::Config) -> Result<(), ValidationError> {
	if name.len() < config.collector_len_min as usize || name.len() > config.collector_len_max as usize {
        let mut err = ValidationError::new("collector name does not fit the length constraints");
        err.add_param(Cow::from("min"), &config.collector_len_min);
        err.add_param(Cow::from("max"), &config.collector_len_max);

        return Err(err);
    }
    let re = Regex::new("^[a-zA-Z0-9_]+( [a-zA-Z0-9_]+)*$").unwrap();

    if !re.is_match(name) {
        return Err(ValidationError::new("collector can only contain letters, numbers, _ and whitespaces in between words"));
    }

    Ok(())
}
