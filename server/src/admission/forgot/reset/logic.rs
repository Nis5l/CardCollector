use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::State;
use rocket::http::Status;

use crate::sql::Sql;
use super::data::{ForgotResetRequest, ForgotResetResponse};
use super::super::shared;
use crate::shared::crypto::bcrypt_hash;
use super::sql;

#[post("/forgot/reset", data="<data>")]
pub async fn forgot_reset_route(sql: &State<Sql>, data: ForgotResetRequest) -> ApiResponseErr<ForgotResetResponse> {
    let user_id = match rjtry!(shared::sql::password_reset_key_user_id(&sql, &data.key).await) {
        Some(user_id) => user_id,
        None => return ApiResponseErr::api_err(Status::NotFound, String::from("Invalid key"))
    };
    let password_hash = rjtry!(bcrypt_hash(&data.password));

    rjtry!(sql::update_password(&sql, &user_id, &password_hash).await);

    ApiResponseErr::ok(Status::Ok, ForgotResetResponse {
        message: String::from("Password successfully reset.")
    })
}
