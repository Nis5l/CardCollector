use rocket::http::Status;
use rocketjson::{rjtry, ApiResponseErr, error::ApiErrorsCreate};
use rocket::State;

use crate::sql::Sql;
use crate::config::Config;
use crate::shared::crypto::{bcrypt_hash, random_string::generate_random_string};
use crate::shared::{user, email, Id};
use super::data::{RegisterRequest, RegisterResponse};
use super::sql;

#[post("/register", data="<data>")]
pub async fn register_route(data: RegisterRequest, sql: &State<Sql>, config: &State<Config>) -> ApiResponseErr<RegisterResponse> {
    //TODO: some sort of timeout
    if rjtry!(user::sql::email_exists(&sql, &data.email).await) {
        return ApiResponseErr::ok(Status::Conflict, RegisterResponse::new(String::from("Mail already in use")));
    }

    if rjtry!(sql::user_exists(&sql, &data.username).await) {
        return ApiResponseErr::ok(Status::Conflict, RegisterResponse::new(String::from("User already exists")));
    }

    let password_hash = rjtry!(bcrypt_hash(&data.password));

    let user_id = Id::new(config.id_length);
    rjtry!(sql::register(&sql, &user_id, &data.username, &password_hash, &data.email).await);

    let verification_key = generate_random_string(config.verification_key_length);

    rjtry!(user::sql::set_verification_key(sql, &user_id, &verification_key).await);

    email::send_email_async(config.email.clone(), config.email_password.clone(), data.email.clone(), verification_key, config.domain.clone(), config.smtp_server.clone(), data.username.clone());

    return ApiResponseErr::api_err(Status::Ok, format!("Register succeeded, verification email will be sent to {} soon", &data.email))
}
