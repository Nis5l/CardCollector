use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::State;
use rocket::http::Status;

use super::sql;
use super::data::{CardTypeRequestVoteRequest, CardTypeRequestVoteResponse};
use crate::shared::Id;
use crate::sql::Sql;
use crate::verify_user;
use crate::shared::crypto::JwtToken;

#[post("/card-type/request/<card_type_id>/vote", data="<data>")]
pub async fn card_type_request_vote_post_route(card_type_id: Id, sql: &State<Sql>, token: JwtToken, data: CardTypeRequestVoteRequest) -> ApiResponseErr<CardTypeRequestVoteResponse> {
    let user_id = &token.id;

    verify_user!(sql, user_id, true);
    rjtry!(sql::vote(sql, user_id, &card_type_id, data.vote).await);

    ApiResponseErr::ok(Status::Ok, CardTypeRequestVoteResponse { message: String::from("Vote cast") })
}
