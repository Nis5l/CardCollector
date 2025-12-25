use rocket::{State, get, http::{ContentType, Status}};
use rocket::serde::json::Json;

use super::manager::{MediaManager, MediaInfo};

/// Get default variant of a media type
#[get("/media/<media_type>/<image_id>")]
pub async fn get_media_default(
    media_type: String,
    image_id: String,
    media_manager: &State<MediaManager>,
) -> Result<(ContentType, Vec<u8>), Status> {
    get_media_variant(media_type, image_id, None, media_manager).await
}

/// Get metadata about all variants for responsive images
/// Ranked higher (lower number) to match before the generic variant route
#[get("/media/<media_type>/<image_id>/info", rank = 1)]
pub async fn get_media_info(
    media_type: String,
    image_id: String,
    media_manager: &State<MediaManager>,
) -> Result<Json<MediaInfo>, String> {
    let info = media_manager
        .get_media_info(&media_type, &image_id)
        .map_err(|e| format!("Failed to get media info: {}", e))?;

    Ok(Json(info))
}

/// Get specific variant of a media type
/// Ranked lower (higher number) so "info" route is tried first
#[get("/media/<media_type>/<image_id>/<variant>", rank = 2)]
pub async fn get_media(
    media_type: String,
    image_id: String,
    variant: String,
    media_manager: &State<MediaManager>,
) -> Result<(ContentType, Vec<u8>), Status> {
    get_media_variant(media_type, image_id, Some(variant), media_manager).await
}

/// Common handler for media retrieval
async fn get_media_variant(
    media_type: String,
    image_id: String,
    variant: Option<String>,
    media_manager: &State<MediaManager>,
) -> Result<(ContentType, Vec<u8>), Status> {
    // Get image with dynamic format
    let (bytes, format) = media_manager
        .get_image(&media_type, &image_id, variant.as_deref())
        .await
        .map_err(|_| Status::NotFound)?;

    // Parse Content-Type based on format
    let content_type = ContentType::parse_flexible(format.mime_type())
        .unwrap_or(ContentType::Binary);

    Ok((content_type, bytes))
}

/// Get all routes for the media module
pub fn routes() -> Vec<rocket::Route> {
    routes![
        get_media_default,
        get_media,
        get_media_info,
    ]
}

#[cfg(test)]
mod tests {
    use super::*;
    use rocket::local::blocking::Client;
    use rocket::Build;
    use std::sync::Arc;
    use std::collections::HashMap;
    use tempfile::TempDir;

    use crate::media::{
        EffectRegistry, MediaTypeConfig, FilesystemCache, ImageStorage, MediaManager,
    };

    fn create_test_rocket() -> rocket::Rocket<Build> {
        // Create temporary directories
        let cache_dir = TempDir::new().unwrap();
        let storage_dir = TempDir::new().unwrap();

        // Create components
        let registry = EffectRegistry::new();
        let cache = Arc::new(FilesystemCache::new(cache_dir.path()));
        let storage = Arc::new(ImageStorage::new(storage_dir.path()));
        let media_types = HashMap::new(); // Empty for testing

        let manager = MediaManager::new(registry, media_types, cache, storage);

        rocket::build()
            .manage(manager)
            .mount("/", routes())
    }

    #[test]
    fn test_routes_mount() {
        // Just verify routes can be created and mounted
        let rocket = create_test_rocket();
        assert!(rocket.routes().count() > 0);
    }
}
