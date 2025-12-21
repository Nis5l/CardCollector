use rocket::State;
use rocket::http::{Status, ContentType};

use crate::sql::Sql;
use crate::media::MediaManager;
use crate::shared::Id;
use crate::shared::collector::sql as collector_sql;

#[get("/collector/<collector_id>/banner")]
pub async fn collector_banner_get_route(
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

    // Get banner hash from database
    let banner_hash = match collector_sql::get_collector_banner(sql, &collector_id).await {
        Ok(Some(hash)) => hash,
        Ok(None) => {
            String::from("collector-banner-default")
        },
        Err(_) => return Err(Status::InternalServerError)
    };

    // Get banner through MediaManager with "banner" media type
    let (bytes, format) = media_manager
        .get_image("banner", &banner_hash, None)
        .await
        .map_err(|_| Status::NotFound)?;

    // Parse Content-Type based on format
    let content_type = ContentType::parse_flexible(format.mime_type())
        .unwrap_or(ContentType::Binary);

    Ok((content_type, bytes))
}
