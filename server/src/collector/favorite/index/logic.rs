use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::{State, http::Status};

use crate::sql::Sql;
use crate::shared::Id;
use crate::shared::collector::Collector;
use crate::verify_user;
use super::sql;

//NOTE: collides with /collector/<collector_id>/favorite
#[get("/collector/favorite/<user_id>", rank=1)]
pub async fn collector_favorite_index_route(user_id: Id, sql: &State<Sql>) -> ApiResponseErr<Vec<Collector>> {
    verify_user!(sql, &user_id, true);

    let collectors: Vec<Collector> = rjtry!(sql::get_favorites(sql, &user_id).await);

    ApiResponseErr::ok(Status::Ok, collectors)
}
