use serde::{Serialize};

use crate::shared::card::data::CardVote;

#[derive(Debug, Serialize)]
pub struct CardRequestVoteGetResponse {
    pub count: i32,
    pub vote: CardVote,
}
