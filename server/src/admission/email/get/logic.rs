use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::State;
use rocket::http::Status;

use super::data::MailGetResponse;
use super::sql;
use crate::sql::Sql;
use crate::shared::crypto::JwtToken;

#[get("/email")]
pub async fn email_get_route(sql: &State<Sql>, token: JwtToken) -> ApiResponseErr<MailGetResponse> {
    let user_id = token.id;
    
    let email = rjtry!(sql::get_email(sql, user_id).await);

    ApiResponseErr::ok(Status::Ok, MailGetResponse {
        email
    })
}
