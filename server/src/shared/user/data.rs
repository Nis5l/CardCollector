use serde_repr::Serialize_repr;
use sqlx::FromRow;
use serde::Serialize;

use crate::config::Config;
use crate::shared::DbParseError;
use crate::shared::Id;

pub enum UserRanking {
    Standard = 0,
    Admin = 1
}

impl UserRanking {
    pub fn from_db(ranking: i32) -> Result<Self, DbParseError> {
        match ranking {
            0 => Ok(Self::Standard),
            1 => Ok(Self::Admin),
            _ => Err(DbParseError)
        }
    }
}

#[derive(Debug, Serialize_repr, PartialEq)]
#[repr(u8)]
pub enum UserVerified {
    No = 0,
    Yes = 1
}

impl UserVerified {
    pub fn from_db(verified: i32) -> Result<Self, DbParseError> {
        match verified {
            0 => Ok(Self::No),
            1 => Ok(Self::Yes),
            _ => Err(DbParseError)
        }
    }
}

#[macro_export]
macro_rules! verify_user {
    ( $sql:expr, $user_id:expr, $is_verified:expr ) => {
        {
            let vd = rocketjson::rjtry!(crate::shared::user::sql::get_verify_data($sql, $user_id).await);

            match vd {
                None => return rocketjson::ApiResponseErr::api_err(rocket::http::Status::NotFound, format!("User with id {} not found", $user_id)),
                Some(vd) => {
                    if ($is_verified) {
                        match rocketjson::rjtry!(crate::shared::user::data::UserVerified::from_db(vd.verified)) {
                            crate::shared::user::data::UserVerified::No => return rocketjson::ApiResponseErr::api_err(rocket::http::Status::Forbidden, format!("User {} not verified", $user_id)),
                            crate::shared::user::data::UserVerified::Yes => ()
                        }
                    }
                    vd.username
                }
            }
        }
    }
}

pub fn validate_password(password: &str, config: &Config) -> Result<(), validator::ValidationError> {
	if password.len() < config.password_len_min as usize || password.len() > config.password_len_max as usize {
        return Err(validator::ValidationError::new("password does not fit the length constraints"));
    }

    Ok(())
}

#[derive(Debug, FromRow)]
pub struct EmailVerifiedDb {
    #[sqlx(rename="uusername")]
    pub username: String,
    #[sqlx(rename="uverified")]
    pub verified: i32,
    #[sqlx(rename="uemail")]
    pub email: String
}

#[derive(Serialize)]
pub struct Badge {
    pub name: &'static str,
    pub asset: &'static str
}

//TODO: this is obv. a placeholder and should be stored in the database!
//8,3: Nissl and SmallCode
const DEVS: [Id; 0] = [];

pub fn get_badges(user_id: &Id) -> Vec<Badge> {
    let mut badges = Vec::new();
    if DEVS.contains(&user_id) {
        badges.push(Badge {
			name: "Developer",
			asset: "/badges/dev.jpg"
        });
    }
    badges
}
