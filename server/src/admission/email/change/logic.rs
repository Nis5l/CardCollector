use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::State;
use rocket::http::Status;

use super::data::{EmailChangeResponse, EmailChangeRequest};
use crate::sql::Sql;
use crate::config::Config;
use crate::shared::crypto::{JwtToken, random_string::generate_random_string};
use crate::shared::{user, email};

#[post("/email/change", data="<data>")]
pub async fn email_change_route(sql: &State<Sql>, config: &State<Config>, data: EmailChangeRequest, token: JwtToken) -> ApiResponseErr<EmailChangeResponse> {
    let user_id = token.id;

    match rjtry!(user::sql::user_verified(sql, &user_id).await) {
        Ok(user::data::UserVerifiedDb::Yes) => return ApiResponseErr::api_err(Status::Conflict, String::from("Already verified")),
        Err(_) => return ApiResponseErr::api_err(Status::InternalServerError, String::from("Internal server error")),
        Ok(user::data::UserVerifiedDb::No) => ()
    }

    if rjtry!(user::sql::email_exists(sql, &data.email).await) {
        return ApiResponseErr::api_err(Status::Conflict, String::from("Email already exists"))
    }

    rjtry!(user::sql::set_email(sql, &user_id, Some(&data.email)).await);

    let verification_key = generate_random_string(config.verification_key_length);

    rjtry!(user::sql::set_verification_key(sql, &user_id, &verification_key).await);

    let username = match rjtry!(user::sql::username_from_user_id(sql, &user_id).await) {
        Some(username) => username,
        None => return ApiResponseErr::api_err(Status::InternalServerError, String::from("Internal server error")),
    };

    email::send_email_async(config.email.clone(), config.email_password.clone(), data.email.clone(), verification_key, config.domain.clone(), config.smtp_server.clone(), username.clone());

    ApiResponseErr::ok(Status::Ok, EmailChangeResponse {
        message: format!("Changed email to {}, verification email will be sent soon", &data.email)
    })
}
