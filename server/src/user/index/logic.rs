use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::{State, http::Status};

use crate::sql::Sql;
use crate::config::Config;
use crate::shared::Id;
use super::sql;
use super::data::UsersResponse;

#[get("/user?<username>&<page>&<excludeIds>")]
pub async fn user_index_route(sql: &State<Sql>, username: Option<String>, page: Option<u32>, excludeIds: Vec<Id>, config: &State<Config> ) -> ApiResponseErr<UsersResponse> {
    let page = page.unwrap_or(0);
    let username = username.unwrap_or(String::from(""));
    println!("exclude: {:?}", excludeIds);
    let users = rjtry!(sql::get_users(&sql, username.clone(), &excludeIds, config.users_page_amount, page * config.users_page_amount).await);

    let user_count = rjtry!(sql::get_users_count(&sql, username, &excludeIds).await);

    ApiResponseErr::ok(Status::Ok, UsersResponse { users, page, page_size: config.users_page_amount, user_count })
}
