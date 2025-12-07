use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::http::Status;
use rocket::State;

use super::data::{PassChangeRequest, PassChangeResponse};
use super::sql;
use crate::shared::crypto::{JwtToken, bcrypt_hash};
use crate::verify_user;
use crate::sql::Sql;

#[post("/passchange", data="<data>")]
pub async fn passchange_route(sql: &State<Sql>, data: PassChangeRequest, token: JwtToken) -> ApiResponseErr<PassChangeResponse> {
    let user_id = token.id;

    verify_user!(sql, &user_id, true);

    let hashed_password = rjtry!(bcrypt_hash(&data.new_password));

    rjtry!(sql::change_password(sql, user_id, &hashed_password).await);

    ApiResponseErr::ok(Status::Ok, PassChangeResponse {
        message: String::from("Changed password")
    })
}
