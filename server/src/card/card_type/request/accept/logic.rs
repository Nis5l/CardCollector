use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::State;
use rocket::http::Status;

use super::sql;
use super::data::CardTypeRequestAcceptResponse;
use crate::shared::Id;
use crate::shared::card;
use crate::sql::Sql;
use crate::{verify_collector_owner_moderator, verify_user};
use crate::shared::crypto::JwtToken;

#[post("/card-type/request/<card_type_id>/accept")]
pub async fn card_type_request_accept_route(card_type_id: Id, sql: &State<Sql>, token: JwtToken) -> ApiResponseErr<CardTypeRequestAcceptResponse> {
    let user_id = &token.id;

    verify_user!(sql, user_id, true);
    let collector_id = rjtry!(card::sql::get_card_type_collector_id(sql, &card_type_id).await);
    verify_collector_owner_moderator!(sql, &collector_id, user_id);

    let card_type = rjtry!(card::sql::get_card_type(sql, &collector_id, &card_type_id).await);

    match card_type.update_card_type {
        Some(ref card_type_reference) => rjtry!(sql::card_type_request_accept_update(sql, &card_type_reference.id, &card_type).await),
        None => rjtry!(sql::card_type_request_accept(sql, &card_type_id).await),
    }

    rjtry!(sql::card_type_remove_duplicates(sql, &collector_id, &card_type_id).await);

    ApiResponseErr::ok(Status::Ok, CardTypeRequestAcceptResponse { message: String::from("Card-Type request accepted") })
}
