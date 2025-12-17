use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::State;
use rocket::http::Status;

use crate::sql::Sql;
use crate::shared::crypto::JwtToken;
use crate::shared::user;
use crate::verify_user;
use super::data::VerifiedResponse;

#[get("/verify/check")]
pub async fn verify_check_route(sql: &State<Sql>, token: JwtToken) -> ApiResponseErr<VerifiedResponse> {
    let user_id = token.id;

    verify_user!(sql, &user_id, false);

    //NOTE: user exists
    let verify_db = rjtry!(user::sql::get_verify_data(sql, &user_id).await).unwrap();

    let verified = rjtry!(user::data::UserVerified::from_db(verify_db.verified));

    ApiResponseErr::ok(Status::Ok, VerifiedResponse {
        verified,
        email: verify_db.email
    })
}
