use serde::{Serialize, Deserialize};
use rocketjson::JsonBody;
use validator::Validate;

use crate::shared::card::data::CardVote;

#[derive(Debug, Serialize)]
pub struct CardTypeRequestVoteResponse {
    pub message: String
}

#[derive(Debug, Serialize, Deserialize, Validate, JsonBody)]
#[serde(rename_all="camelCase")]
pub struct CardTypeRequestVoteRequest {
    pub vote: CardVote
}
