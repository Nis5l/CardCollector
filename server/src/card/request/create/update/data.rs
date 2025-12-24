use serde::{Serialize, Deserialize};
use rocketjson::JsonBody;
use validator::{Validate, ValidationError, ValidateArgs};
use std::borrow::Cow;
use regex::Regex;

use crate::config;
use crate::shared::Id;

#[derive(Debug, Deserialize, Validate, JsonBody)]
#[serde(rename_all="camelCase")]
#[validate(context = config::Config)]
pub struct CardUpdateRequest {
    pub card_id: Id,
    #[validate(custom(function="validate_card_name", use_context))]
    pub name: String,
    pub card_type: Id,
}

#[derive(Debug, Serialize)]
pub struct CardUpdateResponse {
    pub id: Id,
}

//TODO: share
fn validate_card_name(name: &str, config: &config::Config) -> Result<(), ValidationError> {
    if name.len() < config.card_name_len_min as usize || name.len() > config.card_name_len_max as usize {
        let mut err = ValidationError::new("card name does not fit the length constraints");
        err.add_param(Cow::from("min"), &config.card_name_len_min);
        err.add_param(Cow::from("max"), &config.card_name_len_min);

        return Err(err);
    }
    let re = Regex::new("^[a-zA-Z0-9_]+( [a-zA-Z0-9_]+)*$").unwrap();

    if !re.is_match(name) {
        return Err(ValidationError::new("card can only contain letters, numbers, _ and whitespaces in between words"));
    }

    Ok(())
}
