use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::{State, http::Status};

use crate::sql::Sql;
use crate::shared::Id;
use crate::shared::collector;
use crate::{verify_user, verify_collector};
use super::data::CollectorIsAdminResponse;

#[get("/user/<user_id>/<collector_id>/is-admin")]
pub async fn user_collector_is_admin_route(sql: &State<Sql>, user_id: Id, collector_id: Id) -> ApiResponseErr<CollectorIsAdminResponse> {
    verify_user!(sql, &user_id, true);
    verify_collector!(sql, &collector_id);

    let is_admin = rjtry!(collector::sql::collecor_is_admin(sql, &collector_id, &user_id).await);

    ApiResponseErr::ok(Status::Ok, CollectorIsAdminResponse { is_admin })
}
