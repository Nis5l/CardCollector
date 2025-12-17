use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::http::Status;
use rocket::State;

use crate::sql::Sql;
use crate::shared::crypto::JwtToken;
use crate::shared::Id;
use crate::verify_user;
use super::sql;
use super::data::NotificationDeleteReponse;

#[post("/notifications/delete/<notification_id>")]
pub async fn notifications_delete_route(sql: &State<Sql>, notification_id: Id, token: JwtToken) -> ApiResponseErr<NotificationDeleteReponse> {
    let user_id = token.id;

    verify_user!(sql, &user_id, true);

    match rjtry!(sql::delete_notification(sql, &user_id, &notification_id).await) {
        true => ApiResponseErr::ok(Status::Ok, NotificationDeleteReponse {
            message: String::from("Successfully deleted notification")
        }),
        false => ApiResponseErr::api_err(Status::NotFound, format!("No notificaion with id {} found", &notification_id))
    }

}
