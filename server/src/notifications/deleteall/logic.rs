use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::http::Status;
use rocket::State;

use crate::sql::Sql;
use crate::shared::crypto::JwtToken;
use crate::{verify_user, verify_collector};
use super::sql;
use super::data::NotificationDeleteAllReponse;
use crate::shared::Id;

#[post("/notifications/delete/all?<collector_id>")]
pub async fn notifications_delete_all_route(sql: &State<Sql>, token: JwtToken, collector_id: Option<Id>) -> ApiResponseErr<NotificationDeleteAllReponse> {
    let user_id = token.id;

    verify_user!(sql, &user_id, true);
    if let Some(ref collector_id) = collector_id {
        verify_collector!(sql, collector_id);
    };

    let deleted_notifications = rjtry!(sql::delete_all_notifications(sql, &user_id, &collector_id).await);

    ApiResponseErr::ok(Status::Ok, NotificationDeleteAllReponse {
        message: format!("Successfully deleted {} notifications", deleted_notifications)
    })
}
