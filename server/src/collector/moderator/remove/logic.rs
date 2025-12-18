use rocket::{State, http::Status};
use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};

use crate::sql::Sql;
use crate::shared::Id;
use crate::shared::crypto::JwtToken;
use crate::{verify_collector, verify_user, verify_collector_owner};
use crate::shared::collector;

use super::sql;
use super::data::{CollectorRemoveModeratorRequest, CollectorRemoveModeratorResponse};

#[post("/collector/<collector_id>/moderator/remove", data="<data>")]
pub async fn collector_moderator_remove_route(token: JwtToken, sql: &State<Sql>, collector_id: Id, data: CollectorRemoveModeratorRequest) -> ApiResponseErr<CollectorRemoveModeratorResponse> {
    verify_collector!(sql, &collector_id);
    verify_user!(sql, &token.id, true);
    verify_user!(sql, &data.user_id, true);
    verify_collector_owner!(sql, &collector_id, &token.id);

    if !rjtry!(collector::sql::collector_is_moderator(sql, &collector_id, &data.user_id).await) {
        return ApiResponseErr::api_err(Status::Conflict, String::from("User is not a moderator"));
    }

    rjtry!(sql::remove_collector_moderator(sql, &collector_id, &data.user_id).await);

    ApiResponseErr::ok(Status::Ok, CollectorRemoveModeratorResponse {
        message: String::from("User removed as moderator")
    })
}
