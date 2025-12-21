use rocket::State;
use rocket::http::{Status, ContentType};

use crate::sql::Sql;
use crate::media::MediaManager;
use crate::shared::Id;
use crate::shared::collector::sql as collector_sql;

#[get("/collector/<collector_id>/collector-image")]
pub async fn collector_image_get_route(
    collector_id: Id,
    sql: &State<Sql>,
    media_manager: &State<MediaManager>
) -> Result<(ContentType, Vec<u8>), Status> {
    // Check if collector exists
    match collector_sql::collector_exists(sql, &collector_id).await {
        Ok(true) => (),
        Ok(false) => return Err(Status::NotFound),
        Err(_) => return Err(Status::InternalServerError)
    }

    // Get image hash from database
    let image_hash = match collector_sql::get_collector_image(sql, &collector_id).await {
        Ok(Some(hash)) => hash,
        Ok(None) => {
            String::from("collector-image-default")
        },
        Err(_) => return Err(Status::InternalServerError)
    };

    // Get image through MediaManager with "profile" media type
    let (bytes, format) = media_manager
        .get_image("profile", &image_hash, None)
        .await
        .map_err(|_| Status::NotFound)?;

    // Parse Content-Type based on format
    let content_type = ContentType::parse_flexible(format.mime_type())
        .unwrap_or(ContentType::Binary);

    Ok((content_type, bytes))
}
