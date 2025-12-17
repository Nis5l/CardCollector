use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::http::Status;
use rocket::State;
use chrono::{DateTime, Utc, Duration};

use crate::shared::crypto::{JwtToken, random_string::generate_random_string};
use crate::sql::Sql;
use crate::config::Config;
use crate::shared::{user, email};
use crate::verify_user;
use super::data::{VerifyResendResponse, CanResendVerification};
use super::sql;

#[post("/verify/resend")]
pub async fn verify_resend_route(token: JwtToken, sql: &State<Sql>, config: &State<Config>) -> ApiResponseErr<VerifyResendResponse> {
    let user_id = token.id;

    let username = verify_user!(sql, &user_id, false);

    //NOTE: user exists
    let verify_db = rjtry!(user::sql::get_verify_data(sql, &user_id).await).unwrap();

    let verified = rjtry!(user::data::UserVerified::from_db(verify_db.verified));

    if verified == user::data::UserVerified::Yes {
        return ApiResponseErr::api_err(Status::Conflict, String::from("Account already verified"));
    }

    if let CanResendVerification::No(next_time) = can_resend_verification(rjtry!(sql::get_verification_key_created(sql, &user_id).await), config.verification_key_resend_cooldown) {
        return ApiResponseErr::api_err(Status::Conflict, format!("Wait until: {}", next_time));
    }

    let verification_key = generate_random_string(config.verification_key_length);

    rjtry!(user::sql::set_verification_key(sql, &user_id, &verification_key).await);

    email::send_verify_email_async(config.email.clone(), config.email_password.clone(), verify_db.email.clone(), verification_key, config.domain.clone(), config.smtp_server.clone(), username);

    ApiResponseErr::ok(Status::Ok, VerifyResendResponse {
        message: format!("Verification will be sent to {} soon", &verify_db.email)
    })
}

fn can_resend_verification(last_resent: Option<DateTime<Utc>>, verify_resend_cooldown: u32) -> CanResendVerification {
    match last_resent {
        None => {
            return CanResendVerification::Yes;
        },
        Some(time) => {
            let next_time = time + Duration::seconds(verify_resend_cooldown as i64);
            if Utc::now() >= next_time {
                return CanResendVerification::Yes;
            }
            return CanResendVerification::No(next_time);
        }
    }
}
