use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::State;
use rocket::http::Status;

use super::sql;
use super::data::CardRequestVoteGetResponse;
use crate::shared::{card, Id};
use crate::sql::Sql;
use crate::verify_user;
use crate::shared::crypto::JwtToken;

#[get("/card/request/<card_id>/vote")]
pub async fn card_request_vote_get_route(card_id: Id, sql: &State<Sql>, token: JwtToken) -> ApiResponseErr<CardRequestVoteGetResponse> {
    let user_id = &token.id;

    verify_user!(sql, user_id, true);

    let (votes, vote) = match rjtry!(card::sql::get_card_delete_request(sql, &card_id).await) {
        Some(_) => {
            let votes = rjtry!(sql::get_votes_delete(sql, &card_id).await);
            let vote = rjtry!(sql::get_vote_delete(sql, &card_id, &user_id).await);

            (votes, vote)
        },
        None => {
            let votes = rjtry!(sql::get_votes(sql, &card_id).await);
            let vote = rjtry!(sql::get_vote(sql, &card_id, &user_id).await);

            (votes, vote)
        }
    };

    ApiResponseErr::ok(Status::Ok, CardRequestVoteGetResponse { count: votes, vote: vote })
}
