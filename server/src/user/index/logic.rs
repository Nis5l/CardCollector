use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::{State, http::Status};

use crate::sql::Sql;
use crate::config::Config;
use crate::shared::user;
use super::sql;
use super::data::{ UsersResponse, UserResponse };

#[get("/user?<username>&<page>")]
pub async fn user_index_route(sql: &State<Sql>, username: Option<String>, page: Option<u32>, config: &State<Config> ) -> ApiResponseErr<UsersResponse> {
    let page = page.unwrap_or(0);
    let mut username = username.unwrap_or(String::from(""));
    let users_tuple = rjtry!(sql::get_users(&sql, username.clone(), config.users_page_amount, page * config.users_page_amount).await);

    let users = users_tuple.into_iter().map(|t| {
        let badges = user::data::get_badges(&t.1);
        UserResponse { username: t.0, id: t.1, badges }
    }).collect();

    let user_count = rjtry!(sql::get_users_count(&sql, username).await);

    ApiResponseErr::ok(Status::Ok, UsersResponse { users, page, page_size: config.users_page_amount, user_count })
}
