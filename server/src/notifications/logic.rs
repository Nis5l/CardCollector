use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::http::Status;
use rocket::State;

use crate::sql::Sql;
use crate::shared::crypto::JwtToken;
use crate::shared::Id;
use crate::{verify_user, verify_collector};
use super::sql;
use super::data::Notification;

#[get("/notifications?<collector_id>")]
pub async fn notifications_route(collector_id: Option<Id>, sql: &State<Sql>, token: JwtToken) -> ApiResponseErr<Vec<Notification>> {
    let user_id = token.id;

    verify_user!(sql, &user_id, true);
    if let Some(ref collector_id) = collector_id {
        println!("{}", collector_id);
        verify_collector!(sql, &collector_id);
    }

    let notifications = rjtry!(sql::get_notifications(&sql, &user_id, &collector_id).await);

    ApiResponseErr::ok(Status::Ok, notifications)
}
