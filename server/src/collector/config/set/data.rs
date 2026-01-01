use serde::{Serialize, Deserialize};
use validator::{ValidationError, Validate, ValidateArgs};
use rocketjson::JsonBody;
use std::borrow::Cow;

use crate::config;

#[derive(Debug, Serialize)]
pub struct CollectorConfigResponse {
    pub message: String
}

#[derive(Debug, Deserialize, Validate, JsonBody)]
#[serde(rename_all = "camelCase")]
#[validate(context = config::Config)]
pub struct CollectorConfigRequest {
    #[validate(custom(function="validate_pack_cooldown", use_context))]
    pub pack_cooldown: Option<u32>,
    #[validate(custom(function="validate_pack_amount", use_context))]
    pub pack_amount: Option<u32>,
    #[validate(custom(function="validate_pack_quality_min", use_context))]
    pub pack_quality_min: Option<i32>,
    #[validate(custom(function="validate_pack_quality_max", use_context))]
    pub pack_quality_max: Option<i32>
}

fn validate_pack_cooldown(pack_cooldown: u32, config: &config::Config) -> Result<(), ValidationError> {
	if pack_cooldown < config.pack_cooldown_min || pack_cooldown > config.pack_cooldown_max {
        let mut err = ValidationError::new("Pack cooldown not in valid range");
        err.add_param(Cow::from("min"), &config.pack_cooldown_min);
        err.add_param(Cow::from("max"), &config.pack_cooldown_max);

        return Err(err);
    }

    Ok(())
}

fn validate_pack_amount(pack_amount: u32, config: &config::Config) -> Result<(), ValidationError> {
	if pack_amount < config.pack_amount_min || pack_amount > config.pack_amount_max {
        let mut err = ValidationError::new("Pack amount not in valid range");
        err.add_param(Cow::from("min"), &config.pack_amount_min);
        err.add_param(Cow::from("max"), &config.pack_amount_max);

        return Err(err);
    }

    Ok(())
}

fn validate_pack_quality_min(pack_quality_min: i32, config: &config::Config) -> Result<(), ValidationError> {
	if pack_quality_min < config.pack_quality_min_min || pack_quality_min > config.pack_quality_min_max {
        let mut err = ValidationError::new("Pack min quality not in valid range");
        err.add_param(Cow::from("min"), &config.pack_quality_min_min);
        err.add_param(Cow::from("max"), &config.pack_quality_min_max);

        return Err(err);
    }

    Ok(())
}

fn validate_pack_quality_max(pack_quality_max: i32, config: &config::Config) -> Result<(), ValidationError> {
	if pack_quality_max < config.pack_quality_max_min || pack_quality_max > config.pack_quality_max_max {
        let mut err = ValidationError::new("Pack max quality not in valid range");
        err.add_param(Cow::from("min"), &config.pack_quality_max_min);
        err.add_param(Cow::from("max"), &config.pack_quality_max_max);

        return Err(err);
    }

    Ok(())
}
