use std::path::{Path, PathBuf};
use std::io;
use sha2::{Sha256, Digest};
use tokio::fs;

/// Storage for original (source) images using content-addressable hashing
pub struct ImageStorage {
    base_path: PathBuf,
}

impl ImageStorage {
    /// Create a new image storage
    pub fn new<P: Into<PathBuf>>(base_path: P) -> Self {
        Self {
            base_path: base_path.into(),
        }
    }

    /// Initialize storage directory
    pub async fn init(&self) -> Result<(), StorageError> {
        fs::create_dir_all(&self.base_path)
            .await
            .map_err(|e| StorageError::InitError(self.base_path.clone(), e))?;
        Ok(())
    }

    /// Store an image and return its hash-based ID
    pub async fn store(&self, data: &[u8]) -> Result<String, StorageError> {
        // Calculate SHA-256 hash
        let hash = self.calculate_hash(data);

        // Check if already exists (deduplication)
        let path = self.get_path(&hash);
        if path.exists() {
            return Ok(hash);
        }

        // Write file
        fs::write(&path, data)
            .await
            .map_err(|e| StorageError::WriteError(path, e))?;

        Ok(hash)
    }

    /// Retrieve an image by its hash ID
    pub async fn retrieve(&self, image_id: &str) -> Result<Vec<u8>, StorageError> {
        let path = self.get_path(image_id);

        fs::read(&path)
            .await
            .map_err(|e| match e.kind() {
                io::ErrorKind::NotFound => StorageError::NotFound(image_id.to_string()),
                _ => StorageError::ReadError(path, e),
            })
    }

    /// Check if an image exists
    pub async fn exists(&self, image_id: &str) -> bool {
        let path = self.get_path(image_id);
        path.exists()
    }

    /// Delete an image
    pub async fn delete(&self, image_id: &str) -> Result<(), StorageError> {
        let path = self.get_path(image_id);

        match fs::remove_file(&path).await {
            Ok(()) => Ok(()),
            Err(e) if e.kind() == io::ErrorKind::NotFound => Ok(()), // Already deleted
            Err(e) => Err(StorageError::DeleteError(path, e)),
        }
    }

    /// Calculate SHA-256 hash of data
    fn calculate_hash(&self, data: &[u8]) -> String {
        let mut hasher = Sha256::new();
        hasher.update(data);
        let result = hasher.finalize();
        format!("{:x}", result)
    }

    /// Get file path for an image ID
    fn get_path(&self, image_id: &str) -> PathBuf {
        self.base_path.join(format!("{}.bin", image_id))
    }
}

/// Errors that can occur during storage operations
#[derive(Debug)]
pub enum StorageError {
    InitError(PathBuf, io::Error),
    WriteError(PathBuf, io::Error),
    ReadError(PathBuf, io::Error),
    DeleteError(PathBuf, io::Error),
    NotFound(String),
}

impl std::fmt::Display for StorageError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            StorageError::InitError(path, e) => {
                write!(f, "Failed to initialize storage at {}: {}", path.display(), e)
            }
            StorageError::WriteError(path, e) => {
                write!(f, "Failed to write image to {}: {}", path.display(), e)
            }
            StorageError::ReadError(path, e) => {
                write!(f, "Failed to read image from {}: {}", path.display(), e)
            }
            StorageError::DeleteError(path, e) => {
                write!(f, "Failed to delete image at {}: {}", path.display(), e)
            }
            StorageError::NotFound(id) => {
                write!(f, "Image not found: {}", id)
            }
        }
    }
}

impl std::error::Error for StorageError {}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    #[tokio::test]
    async fn test_store_and_retrieve() {
        let temp_dir = TempDir::new().unwrap();
        let storage = ImageStorage::new(temp_dir.path());
        storage.init().await.unwrap();

        let data = b"test image data";
        let image_id = storage.store(data).await.unwrap();

        // Hash should be deterministic
        assert_eq!(image_id.len(), 64); // SHA-256 hex = 64 chars

        // Should be able to retrieve
        let retrieved = storage.retrieve(&image_id).await.unwrap();
        assert_eq!(retrieved, data);
    }

    #[tokio::test]
    async fn test_deduplication() {
        let temp_dir = TempDir::new().unwrap();
        let storage = ImageStorage::new(temp_dir.path());
        storage.init().await.unwrap();

        let data = b"duplicate test";

        // Store same data twice
        let id1 = storage.store(data).await.unwrap();
        let id2 = storage.store(data).await.unwrap();

        // Should get same hash
        assert_eq!(id1, id2);

        // File should only exist once
        assert!(storage.exists(&id1).await);
    }

    #[tokio::test]
    async fn test_not_found() {
        let temp_dir = TempDir::new().unwrap();
        let storage = ImageStorage::new(temp_dir.path());
        storage.init().await.unwrap();

        let result = storage.retrieve("nonexistent").await;
        assert!(matches!(result, Err(StorageError::NotFound(_))));
    }

    #[tokio::test]
    async fn test_delete() {
        let temp_dir = TempDir::new().unwrap();
        let storage = ImageStorage::new(temp_dir.path());
        storage.init().await.unwrap();

        let data = b"delete test";
        let image_id = storage.store(data).await.unwrap();

        assert!(storage.exists(&image_id).await);

        storage.delete(&image_id).await.unwrap();

        assert!(!storage.exists(&image_id).await);
    }
}
