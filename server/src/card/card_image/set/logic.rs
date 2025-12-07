use rocketjson::{ApiResponseErr, error::ApiErrorsCreate, rjtry};
use rocket::http::Status;
use rocket::State;
use rocket::form::Form;
use std::fs;
use std::path::Path;

use crate::sql::Sql;
use crate::config::Config;
use crate::shared::Id;
use crate::shared::crypto::JwtToken;
use crate::verify_user;
use super::data::{CardImageSetRequest, CardImageSetResponse};
use crate::scripts::resize_image_card;
use super::sql;

#[put("/card/<card_id>/card-image", data="<data>")]
pub async fn card_image_set_route(card_id: Id,
                                       mut data: Form<CardImageSetRequest<'_>>,
                                       sql: &State<Sql>,
                                       config: &State<Config>,
                                       token: JwtToken) -> ApiResponseErr<CardImageSetResponse> {
    let user_id = token.id;
    verify_user!(sql, &user_id, true);

    if !rjtry!(sql::can_set_card_image(sql, &card_id, &user_id).await) {
         return ApiResponseErr::api_err(Status::Unauthorized, String::from("Not permitted to set card image"))
    }

    let path = Path::new(&config.card_fs_base).join(card_id.to_string());
    if let Err(_) = fs::create_dir_all(&path) {
         return ApiResponseErr::api_err(Status::InternalServerError, String::from("fs error"))
    }

    if let Err(_) = data.file.copy_to(path.join("card-image")).await {
         return ApiResponseErr::api_err(Status::InternalServerError, String::from("error saving file"))
    }

    resize_image_card(path.join("card-image"));

    ApiResponseErr::ok(Status::Ok, CardImageSetResponse {
        message: String::from("card image set")
    })
}
