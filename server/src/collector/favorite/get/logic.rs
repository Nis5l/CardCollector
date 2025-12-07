use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::{State, http::Status};

use crate::sql::Sql;
use crate::shared::Id;
use crate::shared::crypto::JwtToken;
use crate::{verify_user, verify_collector};
use super::data::CollectorFavoriteGetResponse;
use super::sql;

#[get("/collector/<collector_id>/favorite")]
pub async fn collector_favorite_get_route(collector_id: Id, token: JwtToken, sql: &State<Sql>) -> ApiResponseErr<CollectorFavoriteGetResponse> {
    let user_id = token.id;
    verify_user!(sql, &user_id, true);
    verify_collector!(sql, &collector_id);

    let is_favorite: bool = rjtry!(sql::is_favorite(sql, &user_id, &collector_id).await);

    ApiResponseErr::ok(Status::Ok, CollectorFavoriteGetResponse {
        favorite: is_favorite
    })
}
