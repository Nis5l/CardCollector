use serde::{Serialize, Deserialize};
use rocketjson::JsonBody;
use validator::{Validate, ValidationError};
use std::borrow::Cow;
use regex::Regex;

use crate::config;
use crate::shared::Id;

#[derive(Debug, Serialize)]
pub struct CardRequestAcceptResponse {
    pub message: String
}
