use rocket::State;
use rocket::http::{Status, ContentType};

use crate::sql::Sql;
use crate::media::MediaManager;
use crate::shared::Id;
use crate::shared::user::sql as user_sql;

#[get("/user/<user_id>/profile-image")]
pub async fn profile_image_get_route(
    user_id: Id,
    sql: &State<Sql>,
    media_manager: &State<MediaManager>
) -> Result<(ContentType, Vec<u8>), Status> {
    // Check if user exists
    match user_sql::username_from_user_id(sql, &user_id).await {
        Ok(Some(_)) => (),
        Ok(None) => return Err(Status::NotFound),
        Err(_) => return Err(Status::InternalServerError)
    }

    // Get image hash from database
    let image_hash = match user_sql::get_profile_image(sql, &user_id).await {
        Ok(Some(hash)) => hash,
        Ok(None) => {
            String::from("profile-image-default")
        },
        Err(_) => return Err(Status::InternalServerError)
    };
    
    // Get image through MediaManager with "profile" media type and "default" variant
    let (bytes, format) = media_manager
        .get_image("profile", &image_hash, None)
        .await
        .map_err(|_| Status::NotFound)?;

    // Parse Content-Type based on format
    let content_type = ContentType::parse_flexible(format.mime_type())
        .unwrap_or(ContentType::Binary);

    Ok((content_type, bytes))
}
