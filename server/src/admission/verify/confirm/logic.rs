use rocketjson::{rjtry, error::ApiErrorsCreate, ApiResponseErr};
use rocket::http::Status;
use rocket::State;

use super::data::VerifyConfirmResponse;
use super::sql;
use crate::sql::Sql;
use crate::shared::user;

#[post("/verify/confirm/<key>")]
pub async fn verify_confirm_route(key: String, sql: &State<Sql>) -> ApiResponseErr<VerifyConfirmResponse> {
    let user_id = match rjtry!(sql::get_user_id_by_verification_key(sql, &key).await) {
        Some(verified_key) => verified_key,
        None => return ApiResponseErr::api_err(Status::BadRequest, String::from("Verification key invalid"))
    };

    if let user::data::UserVerified::Yes = rjtry!(user::data::UserVerified::from_db(rjtry!(sql::user_verified(sql, &user_id).await))) {
        return ApiResponseErr::api_err(Status::Conflict, String::from("Already verified"));
    };

    rjtry!(sql::verify_user(sql, &user_id).await);

    ApiResponseErr::ok(Status::Ok, VerifyConfirmResponse {
        message: String::from("Successfully verified")
    })
}
