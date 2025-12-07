use jwt::{SignWithKey, VerifyWithKey};
use hmac::{Hmac, NewMac};
use sha2::Sha256;
use std::collections::BTreeMap;
use rocket::request::{self, FromRequest, Request};
use rocket::http::Status;
use rocketjson::error::JsonBodyError;
use chrono::{DateTime, Duration, Utc};

use crate::config::Config;
use crate::shared::Id;

pub struct JwtToken {
    pub username: String,
    pub id: Id
}

pub enum JwtTokenError {
    Expired,
    ParseError(jwt::Error)
}

impl JwtToken {
    pub fn new(username: String, id: Id) -> Self {
        JwtToken {
            username,
            id
        }
    }
}

#[rocket::async_trait]
impl<'r> FromRequest<'r> for JwtToken {
    type Error = ();

    async fn from_request(req: &'r Request<'_>) -> request::Outcome<Self, Self::Error> {
        let token = req.headers().get_one("Authorization");
        match token {
          Some(token_str_full) => {
            if !token_str_full.starts_with("Bearer") {
              req.local_cache(|| JsonBodyError::CustomError(String::from("Token has to be of Bearer type")));
              return request::Outcome::Error((Status::BadRequest, ()));
            }

            if token_str_full.len() < 8 {
              req.local_cache(|| JsonBodyError::CustomError(String::from("No token found")));
              return request::Outcome::Error((Status::BadRequest, ()));
            }

            let token_str = &token_str_full[7..];

            let config = req.rocket().state::<Config>().expect("Config not found in state");

            match jwt_verify_token(token_str, &config.jwt_secret, &Duration::seconds(config.jwt_duration as _)) {
                Ok(token) => return request::Outcome::Success(token),
                Err(JwtTokenError::Expired) => {
                    req.local_cache(|| JsonBodyError::CustomError(String::from("Authorization token expired")));
                    return request::Outcome::Error((Status::Unauthorized, ()));
                },
                Err(JwtTokenError::ParseError(_)) => {
                    req.local_cache(|| JsonBodyError::CustomError(String::from("Invalid authorization token")));
                    return request::Outcome::Error((Status::Unauthorized, ()));
                }
            }
          },
          None => {
              req.local_cache(|| JsonBodyError::CustomError(String::from("Authorization token missing")));
              request::Outcome::Error((Status::Unauthorized, ()))
          }
        }
    }
}

pub fn jwt_sign_token(username: &str, user_id: &Id, secret: &str) -> Result<String, jwt::Error> {
    let key: Hmac<Sha256> = Hmac::new_from_slice(&bincode::serialize(secret).expect("Serializing jwt secret failed!"))?;
    let mut btree = BTreeMap::new();
    let user_id_str = user_id.to_string();
    let now_str = Utc::now().to_rfc3339();
    btree.insert("username", username);
    btree.insert("id", &user_id_str);
    btree.insert("time", &now_str);
    btree.sign_with_key(&key)
}

pub fn jwt_verify_token(token: &str, secret: &str, jwt_duration: &Duration) -> Result<JwtToken, JwtTokenError> {
    let key: Hmac<Sha256> = Hmac::new_from_slice(&bincode::serialize(secret).expect("Serializing jwt secret failed!")).expect("HMAC failed");

    let btree: BTreeMap<String, String> = match token.verify_with_key(&key) {
        Ok(btree) => btree,
        Err(err) => return Err(JwtTokenError::ParseError(err))
    };

    let username = btree.get("username");
    let user_id_str = btree.get("id");

    let time = btree.get("time");

    match time {
        Some(time_str) => {
            let time = match DateTime::parse_from_rfc3339(time_str) {
                Ok(time) => time,
                Err(_) => return Err(JwtTokenError::ParseError(jwt::Error::Format))
            };

            if time + *jwt_duration < Utc::now() {
                return Err(JwtTokenError::Expired);
            }
        },
        None => {
            return Err(JwtTokenError::ParseError(jwt::Error::Format));
        }
    }

    if username.is_none() || user_id_str.is_none() {
        return Err(JwtTokenError::ParseError(jwt::Error::Format));
    }

    let user_id = user_id_str.unwrap().parse::<Id>();

    if user_id.is_err() {
        return Err(JwtTokenError::ParseError(jwt::Error::Format));
    }

    Ok(JwtToken::new(username.unwrap().clone(), user_id.unwrap()))
}
