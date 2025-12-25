use rocketjson::{ApiResponseErr, error::ApiErrorsCreate, rjtry};
use rocket::http::Status;
use rocket::State;
use rocket::form::Form;

use crate::sql::Sql;
use crate::media::MediaManager;
use crate::shared::Id;
use crate::shared::crypto::JwtToken;
use crate::shared::image_upload::upload_image_with_media_manager;
use crate::shared::card::sql as card_sql;
use crate::verify_user;
use super::data::{CardImageSetRequest, CardImageSetResponse};
use super::sql;

#[put("/card/<card_id>/card-image", data="<data>")]
pub async fn card_image_set_route(
    card_id: Id,
    mut data: Form<CardImageSetRequest<'_>>,
    sql: &State<Sql>,
    media_manager: &State<MediaManager>,
    token: JwtToken
) -> ApiResponseErr<CardImageSetResponse> {
    let user_id = token.id;
    verify_user!(sql, &user_id, true);

    if !rjtry!(sql::can_set_card_image(sql, &card_id, &user_id).await) {
         return ApiResponseErr::api_err(Status::Unauthorized, String::from("Not permitted to set card image"))
    }

    // Upload image to MediaManager (returns hash-based ID)
    let image_hash = match upload_image_with_media_manager(&mut data.file, media_manager).await {
        Ok(hash) => hash,
        Err(_) => return ApiResponseErr::api_err(Status::InternalServerError, String::from("Error uploading image"))
    };

    // Store hash in database
    if let Err(_) = card_sql::set_card_image(sql, &card_id, &image_hash).await {
        return ApiResponseErr::api_err(Status::InternalServerError, String::from("Error saving image reference"))
    }

    ApiResponseErr::ok(Status::Ok, CardImageSetResponse {
        message: String::from("card image set")
    })
}
