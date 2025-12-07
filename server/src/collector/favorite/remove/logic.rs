use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::{State, http::Status};

use crate::sql::Sql;
use crate::shared::Id;
use crate::shared::crypto::JwtToken;
use crate::{verify_user, verify_collector};
use super::sql;
use super::data::CollectorFavoriteRemoveResponse;

#[post("/collector/<collector_id>/favorite/remove")]
pub async fn collector_favorite_remove_route(collector_id: Id, token: JwtToken, sql: &State<Sql>) -> ApiResponseErr<CollectorFavoriteRemoveResponse> {
    let user_id = token.id;
    verify_user!(sql, &user_id, true);
    verify_collector!(sql, &collector_id);

    rjtry!(sql::remove_favorite(&sql, &user_id, &collector_id).await);

    ApiResponseErr::ok(Status::Ok, CollectorFavoriteRemoveResponse {
        message: format!("Removed collector {} from favorites", collector_id)
    })
}
