use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::State;
use rocket::http::Status;
use std::fs;
use std::io;

use super::data::AdminLogResponse;
use crate::sql::Sql;
use crate::config::Config;
use crate::shared::crypto::JwtToken;
use crate::shared::user;

#[get("/admin/log")]
pub async fn admin_log_route(sql: &State<Sql>, config: &State<Config>, token: JwtToken) -> ApiResponseErr<AdminLogResponse> {
    let user_id = token.id;

    if rjtry!(user::sql::get_user_rank(sql, &user_id).await) != user::data::UserRanking::Admin {
        return ApiResponseErr::api_err(Status::Forbidden, String::from("Missing admin permissions"))
    }

    let log = rjtry!(read_logfile(&config.log_file));

    ApiResponseErr::ok(Status::Ok, AdminLogResponse {
        log
    })
}

fn read_logfile(path: &str) -> io::Result<String> {
    fs::read_to_string(path)
}
