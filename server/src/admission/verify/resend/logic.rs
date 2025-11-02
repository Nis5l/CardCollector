use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::http::Status;
use rocket::State;

use crate::shared::crypto::{JwtToken, random_string::generate_random_string};
use crate::sql::Sql;
use crate::config::Config;
use crate::shared::{user, email};
use crate::verify_user;
use super::data::VerifyResendResponse;

//TODO: cooldown
#[post("/verify/resend")]
pub async fn verify_resend_route(token: JwtToken, sql: &State<Sql>, config: &State<Config>) -> ApiResponseErr<VerifyResendResponse> {
    let user_id = token.id;

    let username = verify_user!(sql, &user_id, false);

    //NOTE: user exists
    let verify_db = rjtry!(user::sql::get_verify_data(sql, &user_id).await).unwrap();

    let verified = rjtry!(user::data::UserVerified::from_db(&verify_db.email, verify_db.verified));

    if !matches!(verified, user::data::UserVerified::NotVerified) {
        return ApiResponseErr::api_err(Status::Conflict, String::from("Account already verified or email not set"));
    }

    //NOTE: has to be set now because otherwise it would be UserVerified::MailNotSet
    let email = verify_db.email.unwrap();

    let verification_key = generate_random_string(config.verification_key_length);

    rjtry!(user::sql::set_verification_key(sql, &user_id, &verification_key).await);

    email::send_email_async(config.email.clone(), config.email_password.clone(), email.clone(), verification_key, config.domain.clone(), config.smtp_server.clone(), username);

    ApiResponseErr::ok(Status::Ok, VerifyResendResponse {
        message: format!("Verification will be sent to {} soon", &email)
    })
}
