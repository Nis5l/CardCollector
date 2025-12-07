use chrono::Duration;
use rocketjson::{ApiResponseErr, rjtry,error::ApiErrorsCreate};
use rocket::http::{Status, CookieJar, Cookie};
use rocket::State;

use crate::shared::crypto::jwt_util::JwtTokenError;
use crate::shared::crypto::{jwt_verify_token, jwt_sign_token};
use crate::shared::util::build_refresh_token_cookie;
use crate::sql::Sql;
use crate::config::Config;

use super::data::{RefreshResponse, UserRoleDb};
use super::sql;

#[get("/refresh")]
pub async fn refresh_route(cookies: &CookieJar<'_>, sql: &State<Sql>, config: &rocket::State<Config>) -> ApiResponseErr<RefreshResponse>{
    let refresh_token_cookie = cookies.get("refresh_token").ok_or("");

    let refresh_token = match refresh_token_cookie {
        Ok(token) => token.value(),
        _ => return ApiResponseErr::api_err(Status::Unauthorized, String::from("No refresh token"))
    };

    let token = match jwt_verify_token(&refresh_token, &config.refresh_token_secret, &Duration::seconds(config.refresh_token_duration as _)) {
        Ok(token) => token,
        Err(JwtTokenError::Expired) => {
            match sql::delete_refresh_token(&sql, refresh_token).await {
                _ => return ApiResponseErr::api_err(Status::Unauthorized, String::from("Refresh token expired"))
            };
        },
        Err(JwtTokenError::ParseError(_)) => {
            return ApiResponseErr::api_err(Status::Unauthorized, String::from("Could not parse refresh token"));
        }
    };

    let refresh_token_alright = match sql::check_refresh_token(&sql, &token.id, &refresh_token).await {
        Ok(value) => value,
        Err(_) => return ApiResponseErr::api_err(Status::Unauthorized, String::from("Wrong username or password"))
    };

    if !refresh_token_alright {
        return ApiResponseErr::api_err(Status::Unauthorized, String::from("Invalid refresh token"));
    }

    //NOTE: GENERATE NEW ACCESS TOKEN AND REFRESH TOKEN

    let username = token.username.clone();
    let new_access_token: String = match jwt_sign_token(&username, &token.id, &config.jwt_secret) {
        Ok(token) => token,
        Err(_) => return ApiResponseErr::api_err(Status::InternalServerError, String::from("Internal server error"))
    };

    let UserRoleDb { username: _, role } = if let Some(user_role_db) = rjtry!(sql::get_user_role(&sql, String::from(token.username)).await) {
        user_role_db
    } else {
        return ApiResponseErr::api_err(Status::Unauthorized, String::from("Could not find user"));
    };

    if config.refresh_token_rotation_strategy {
        let new_refresh_token: String = match jwt_sign_token(&username, &token.id, &config.refresh_token_secret) {
            Ok(token) => token,
            Err(_) => return ApiResponseErr::api_err(Status::InternalServerError, String::from("Internal server error"))
        };

        rjtry!(sql::delete_refresh_token(&sql, refresh_token).await);
        rjtry!(sql::insert_refresh_token(&sql, &token.id, &new_refresh_token).await);

        let refresh_token_cookie: Cookie = build_refresh_token_cookie(new_refresh_token.clone(), config.refresh_token_duration.into());
        cookies.add(refresh_token_cookie);
    }

    ApiResponseErr::ok(Status::Ok, RefreshResponse { access_token: new_access_token, role })
}
