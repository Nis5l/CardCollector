use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::State;
use rocket::http::Status;

use crate::sql::Sql;
use super::data::ForgotCheckResponse;
use super::super::shared::sql;

#[get("/forgot/check/<key>")]
pub async fn forgot_check_route(sql: &State<Sql>, key: String) -> ApiResponseErr<ForgotCheckResponse> {
    match rjtry!(sql::password_reset_key_user_id(&sql, &key).await) {
        Some(_) => ApiResponseErr::ok(Status::Ok, ForgotCheckResponse {
            message: String::from("key valid")
        }),
        None => ApiResponseErr::api_err(Status::BadRequest, String::from("key not valid"))
    }
}
