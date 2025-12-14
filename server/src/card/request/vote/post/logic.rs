use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::State;
use rocket::http::Status;

use super::sql;
use super::data::{CardRequestVoteRequest, CardRequestVoteResponse};
use crate::shared::Id;
use crate::sql::Sql;
use crate::verify_user;
use crate::shared::crypto::JwtToken;

#[post("/card/request/<card_id>/vote", data="<data>")]
pub async fn card_request_vote_post_route(card_id: Id, sql: &State<Sql>, token: JwtToken, data: CardRequestVoteRequest) -> ApiResponseErr<CardRequestVoteResponse> {
    let user_id = &token.id;

    verify_user!(sql, user_id, true);
    rjtry!(sql::vote(sql, user_id, &card_id, data.vote).await);

    ApiResponseErr::ok(Status::Ok, CardRequestVoteResponse { message: String::from("Vote cast") })
}
