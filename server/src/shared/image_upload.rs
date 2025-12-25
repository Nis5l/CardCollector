use rocket::fs::TempFile;
use rocket::State;
use std::fs;
use std::path::PathBuf;

use crate::media::MediaManager;

/// Common image upload handler that uses MediaManager for hash-based storage
///
/// This function:
/// 1. Reads the uploaded file bytes
/// 2. Uploads to MediaManager (which returns a content-hash ID)
/// 3. Returns the image hash for database storage
pub async fn upload_image_with_media_manager(
    file: &mut TempFile<'_>,
    media_manager: &State<MediaManager>,
) -> Result<String, UploadError> {
    // Read file bytes
    let bytes = tokio::fs::read(file.path().ok_or(UploadError::NoFilePath)?)
        .await
        .map_err(|_| UploadError::ReadError)?;

    // Upload to MediaManager (returns hash-based ID)
    let image_id = media_manager
        .upload_image(&bytes)
        .await
        .map_err(|_| UploadError::MediaManagerError)?;

    Ok(image_id)
}

/// Legacy common upload handler for filesystem-based storage
///
/// This function handles the common logic for uploading images to the filesystem:
/// 1. Creates the directory if it doesn't exist
/// 2. Copies the file to the destination
/// 3. Optionally applies a resize function
pub async fn upload_image_legacy<F>(
    file: &mut TempFile<'_>,
    destination: PathBuf,
    resize_fn: Option<F>,
) -> Result<(), UploadError>
where
    F: FnOnce(PathBuf),
{
    // Create parent directory if it doesn't exist
    if let Some(parent) = destination.parent() {
        fs::create_dir_all(parent).map_err(|_| UploadError::CreateDirError)?;
    }

    // Copy file to destination
    file.copy_to(&destination)
        .await
        .map_err(|_| UploadError::CopyError)?;

    // Apply resize function if provided
    if let Some(resize) = resize_fn {
        resize(destination);
    }

    Ok(())
}

#[derive(Debug)]
pub enum UploadError {
    NoFilePath,
    ReadError,
    CreateDirError,
    CopyError,
    MediaManagerError,
}

impl std::fmt::Display for UploadError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            UploadError::NoFilePath => write!(f, "No file path available"),
            UploadError::ReadError => write!(f, "Failed to read file"),
            UploadError::CreateDirError => write!(f, "Failed to create directory"),
            UploadError::CopyError => write!(f, "Failed to copy file"),
            UploadError::MediaManagerError => write!(f, "Media manager error"),
        }
    }
}

impl std::error::Error for UploadError {}
