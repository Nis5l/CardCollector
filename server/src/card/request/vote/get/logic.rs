use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::State;
use rocket::http::Status;

use super::sql;
use super::data::CardRequestVoteGetResponse;
use crate::shared::Id;
use crate::sql::Sql;
use crate::verify_user;
use crate::shared::crypto::JwtToken;

#[get("/card/request/<card_id>/vote")]
pub async fn card_request_vote_get_route(card_id: Id, sql: &State<Sql>, token: JwtToken) -> ApiResponseErr<CardRequestVoteGetResponse> {
    let user_id = &token.id;

    verify_user!(sql, user_id, true);

    let votes = rjtry!(sql::get_votes(sql, &card_id).await);
    let vote = rjtry!(sql::get_vote(sql, &card_id, &user_id).await);

    ApiResponseErr::ok(Status::Ok, CardRequestVoteGetResponse { count: votes, vote: vote })
}
