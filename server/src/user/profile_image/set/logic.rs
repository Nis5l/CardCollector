use rocketjson::{ApiResponseErr, error::ApiErrorsCreate};
use rocket::http::Status;
use rocket::State;
use rocket::form::Form;

use crate::sql::Sql;
use crate::media::MediaManager;
use crate::shared::crypto::JwtToken;
use crate::shared::image_upload::upload_image_with_media_manager;
use crate::shared::user::sql as user_sql;
use crate::verify_user;
use super::data::{ProfileImageSetResponse, ProfileImageSetRequest};

#[put("/user/profile-image", data="<data>")]
pub async fn profile_image_set_route(
    mut data: Form<ProfileImageSetRequest<'_>>,
    sql: &State<Sql>,
    media_manager: &State<MediaManager>,
    token: JwtToken
) -> ApiResponseErr<ProfileImageSetResponse> {
    let user_id = token.id;
    verify_user!(sql, &user_id, true);

    // Upload image to MediaManager (returns hash-based ID)
    let image_hash = match upload_image_with_media_manager(&mut data.file, media_manager).await {
        Ok(hash) => hash,
        Err(_) => return ApiResponseErr::api_err(Status::InternalServerError, String::from("Error uploading image"))
    };

    // Store hash in database
    if let Err(_) = user_sql::set_profile_image(sql, &user_id, &image_hash).await {
        return ApiResponseErr::api_err(Status::InternalServerError, String::from("Error saving image reference"))
    }

    ApiResponseErr::ok(Status::Ok, ProfileImageSetResponse {
        message: String::from("Profile image set")
    })
}
