use rocketjson::{ApiResponseErr, error::ApiErrorsCreate};
use rocket::http::Status;
use rocket::State;
use rocket::form::Form;

use crate::sql::Sql;
use crate::media::MediaManager;
use crate::shared::Id;
use crate::shared::crypto::JwtToken;
use crate::shared::image_upload::upload_image_with_media_manager;
use crate::shared::collector::sql as collector_sql;
use crate::{verify_user, verify_collector, verify_collector_owner_moderator};
use super::data::{CollectorBannerSetRequest, CollectorBannerSetResponse};

#[put("/collector/<collector_id>/banner", data="<data>")]
pub async fn collector_banner_set_route(
    collector_id: Id,
    mut data: Form<CollectorBannerSetRequest<'_>>,
    sql: &State<Sql>,
    media_manager: &State<MediaManager>,
    token: JwtToken
) -> ApiResponseErr<CollectorBannerSetResponse> {
    let user_id = token.id;
    verify_user!(sql, &user_id, true);
    verify_collector!(sql, &collector_id);
    verify_collector_owner_moderator!(sql, &collector_id, &user_id);

    // Upload banner to MediaManager (returns hash-based ID)
    let banner_hash = match upload_image_with_media_manager(&mut data.file, media_manager).await {
        Ok(hash) => hash,
        Err(_) => return ApiResponseErr::api_err(Status::InternalServerError, String::from("Error uploading banner"))
    };

    // Store hash in database
    if let Err(_) = collector_sql::set_collector_banner(sql, &collector_id, &banner_hash).await {
        return ApiResponseErr::api_err(Status::InternalServerError, String::from("Error saving banner reference"))
    }

    ApiResponseErr::ok(Status::Ok, CollectorBannerSetResponse {
        message: String::from("collector banner set")
    })
}
