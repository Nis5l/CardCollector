use chrono::Duration;
use rocketjson::{ApiResponseErr};
use rocket::http::{Status, CookieJar, Cookie};
use rocket::State;

use crate::shared::crypto::jwt_util::JwtTokenError;
use crate::shared::crypto::jwt_verify_token;
use crate::sql::Sql;
use crate::config::Config;

use super::data::{LogoutResponse};
use super::sql;

#[post("/logout")]
pub async fn logout_route(cookies: &CookieJar<'_>, sql: &State<Sql>, config: &rocket::State<Config>) -> ApiResponseErr<LogoutResponse> {
    let refresh_token_cookie = cookies.get("refresh_token").ok_or("");
    let refresh_token = match refresh_token_cookie {
        Ok(token) => token.value(),
        _ => return ApiResponseErr::api_err(Status::Unauthorized, String::from("No refresh token"))
    };

    match jwt_verify_token(&refresh_token, &config.refresh_token_secret, &Duration::seconds(config.refresh_token_duration as _)) {
        Err(JwtTokenError::ParseError(_)) => {
            return  ApiResponseErr::api_err(Status::Unauthorized, String::from("Could not parse refresh token"));
        },
        _ => {
            match sql::delete_refresh_token(&sql, refresh_token).await {
                Err(_) => return ApiResponseErr::api_err(Status::Unauthorized, String::from("Could not delete refresh token")),
                Ok(_) => {}
            }
        }
    }

    cookies.remove(Cookie::named("refresh_token"));

    ApiResponseErr::ok(Status::Ok, LogoutResponse { message: String::from("Logged out") })
}
