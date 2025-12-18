use rocket::{State, http::Status};
use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};

use crate::sql::Sql;
use crate::shared::Id;
use crate::shared::crypto::JwtToken;
use crate::{verify_collector, verify_user, verify_collector_owner};
use crate::shared::collector;
use crate::config::Config;

use super::sql;
use super::data::{CollectorAddModeratorRequest, CollectorAddModeratorResponse};

#[post("/collector/<collector_id>/moderator/add", data="<data>")]
pub async fn collector_moderator_add_route(token: JwtToken, sql: &State<Sql>, config: &State<Config>, collector_id: Id, data: CollectorAddModeratorRequest) -> ApiResponseErr<CollectorAddModeratorResponse> {
    verify_collector!(sql, &collector_id);
    verify_user!(sql, &token.id, true);
    verify_user!(sql, &data.user_id, true);
    verify_collector_owner!(sql, &collector_id, &token.id);

    if rjtry!(collector::sql::collector_is_owner_or_moderator(sql, &collector_id, &data.user_id).await) {
        return ApiResponseErr::api_err(Status::Conflict, String::from("User alerady is owner or moderator"));
    }

    if rjtry!(sql::collector_moderator_count(sql, &collector_id).await) >= config.collector_moderator_limit as i32 {
        return ApiResponseErr::api_err(Status::Conflict, String::from("Moderator limit reached"));
    }

    rjtry!(sql::add_collector_moderator(sql, &collector_id, &data.user_id).await);

    ApiResponseErr::ok(Status::Ok, CollectorAddModeratorResponse {
        message: String::from("User added as moderator")
    })
}
