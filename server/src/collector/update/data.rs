use rocketjson::JsonBody;
use validator::{Validate, ValidationError, ValidateArgs};
use serde::{Serialize, Deserialize};
use std::borrow::Cow;
use regex::Regex;

use crate::shared::Id;
use crate::config;

#[derive(Debug, Serialize)]
pub struct CollectorUpdateResponse {
    pub message: String
}

#[derive(Debug, Deserialize, Validate, JsonBody)]
#[validate(context = config::Config)]
pub struct CollectorUpdateRequest {
    pub id: Id,
    #[validate(custom(function="validate_collector_name", use_context))]
    pub name: String,
    #[validate(custom(function="validate_collector_description", use_context))]
    pub description: String
}

//TODO: share validation
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

//TODO: share validation
fn validate_collector_description(description: &str, config: &config::Config) -> Result<(), ValidationError> {
	if description.len() < config.collector_desciption_len_min as usize || description.len() > config.collector_desciption_len_max as usize {
        let mut err = ValidationError::new("collector description does not fit the length constraints");
        err.add_param(Cow::from("min"), &config.collector_len_min);
        err.add_param(Cow::from("max"), &config.collector_len_max);

        return Err(err);
    }
    /*
    let re = Regex::new("^[a-zA-Z0-9_]+( [a-zA-Z0-9_]+)*$").unwrap();

    if !re.is_match(description) {
        return Err(ValidationError::new("collector description can only contain letters, numbers, _ and whitespaces in between words"));
    }
    */

    Ok(())
}
