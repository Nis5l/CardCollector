use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::http::Status;
use rocket::State;
use chrono::{DateTime, Utc, Duration};

use crate::shared::crypto::random_string::generate_random_string;
use crate::sql::Sql;
use crate::config::Config;
use crate::shared::email;
use super::data::{ForgotSendRequest, ForgotSendResponse, CanResendForgot};
use super::sql;

#[post("/forgot", data="<data>")]
pub async fn forgot_send_route(sql: &State<Sql>, config: &State<Config>, data: ForgotSendRequest) -> ApiResponseErr<ForgotSendResponse> {
    let res = ApiResponseErr::ok(Status::Ok, ForgotSendResponse {
        message: String::from("If an account exists and the request is valid, a password reset link has been sent.")
    });

    let (user_id, username, email) = match rjtry!(sql::user_from_username_or_email(sql, &data.username_or_email).await) {
        None => {
            return res;
        },
        Some(res) => res
    };

    if let CanResendForgot::No(_next_time) = can_resend_forgot(rjtry!(sql::get_password_reset_key_created(sql, &user_id).await), config.forgot_resend_cooldown) {
        return res;
    }

    let forgot_key = generate_random_string(config.forgot_key_length);

    rjtry!(sql::set_password_reset_key(sql, &user_id, &forgot_key).await);

    email::send_forgot_email_async(config.email.clone(), config.email_password.clone(), email, forgot_key, config.domain.clone(), config.smtp_server.clone(), username);

    res
}

fn can_resend_forgot(last_resent: Option<DateTime<Utc>>, forgot_resend_cooldown: u32) -> CanResendForgot {
    match last_resent {
        None => {
            return CanResendForgot::Yes;
        },
        Some(time) => {
            let next_time = time + Duration::seconds(forgot_resend_cooldown as i64);
            if Utc::now() >= next_time {
                return CanResendForgot::Yes;
            }
            return CanResendForgot::No(next_time);
        }
    }
}
