use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::http::Status;
use rocket::State;
use chrono::Duration;

use crate::shared::crypto::JwtToken;
use crate::sql::Sql;
use crate::config::Config;
use crate::shared::user;
use crate::verify_user;
use super::data::VerifyTimeResponse;
use super::sql;

#[get("/verify/time")]
pub async fn verify_time_route(token: JwtToken, sql: &State<Sql>, config: &State<Config>) -> ApiResponseErr<VerifyTimeResponse> {
    let user_id = token.id;

    verify_user!(sql, &user_id, false);

    //NOTE: user exists
    let verify_db = rjtry!(user::sql::get_verify_data(sql, &user_id).await).unwrap();

    let verified = rjtry!(user::data::UserVerified::from_db(&verify_db.email, verify_db.verified));

    if !matches!(verified, user::data::UserVerified::NotVerified) {
        return ApiResponseErr::api_err(Status::Conflict, String::from("Account already verified or email not set"));
    }

    let next_time = match rjtry!(sql::get_verification_key_created(sql, &user_id).await) {
        Some(time) => time + Duration::seconds(config.verification_key_resend_cooldown as i64),
        None => {
            return ApiResponseErr::api_err(Status::InternalServerError, String::from("Verification key time not found"));
        }
    };

    ApiResponseErr::ok(Status::Ok, VerifyTimeResponse {
        time: next_time
    })
}
