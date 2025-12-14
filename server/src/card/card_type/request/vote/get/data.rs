use serde::{Serialize};

use crate::shared::card::data::CardVote;

#[derive(Debug, Serialize)]
pub struct CardTypeRequestVoteGetResponse {
    pub count: i32,
    pub vote: CardVote,
}
