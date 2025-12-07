use rocketjson::{ApiResponseErr, error::ApiErrorsCreate, rjtry};
use rocket::State;
use rocket::http::Status;

use super::data::EmailDeleteResponse;
use super::sql;
use crate::sql::Sql;
use crate::shared::crypto::JwtToken;
use crate::shared::user;

#[post("/email/delete")]
pub async fn email_delete_route(sql: &State<Sql>, token: JwtToken) -> ApiResponseErr<EmailDeleteResponse> {
    let user_id = token.id;

    match rjtry!(user::sql::user_verified(sql, &user_id).await) {
        Ok(user::data::UserVerifiedDb::Yes) => return ApiResponseErr::api_err(Status::Conflict, String::from("Already verified")),
        Err(_) => return ApiResponseErr::api_err(Status::InternalServerError, String::from("Internal server error")),
        Ok(user::data::UserVerifiedDb::No) => ()
    }

    rjtry!(user::sql::set_email(sql, &user_id, None).await);
    rjtry!(sql::delete_verification_key(sql, &user_id).await);

    ApiResponseErr::ok(Status::Ok, EmailDeleteResponse {
        message: String::from("Deleted email")
    })
}
