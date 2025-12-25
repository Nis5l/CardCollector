use std::path::{Path, PathBuf};
use std::fs;
use std::io;
use super::effect::ImageFormat;

/// Trait for image caching backends
#[async_trait::async_trait]
pub trait ImageCache: Send + Sync {
    /// Get cached image bytes
    async fn get(&self, key: &CacheKey) -> Result<Option<Vec<u8>>, CacheError>;

    /// Store image bytes in cache
    async fn set(&self, key: &CacheKey, data: &[u8]) -> Result<(), CacheError>;

    /// Check if a key exists in cache
    async fn exists(&self, key: &CacheKey) -> Result<bool, CacheError>;

    /// Delete a cached image
    async fn delete(&self, key: &CacheKey) -> Result<(), CacheError>;

    /// Clear all cached images
    async fn clear(&self) -> Result<(), CacheError>;
}

/// Cache key that uniquely identifies a cached image variant
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct CacheKey {
    /// Media type (e.g., "profile", "card")
    pub media_type: String,

    /// Image ID (hash)
    pub image_id: String,

    /// Variant name (e.g., "thumbnail", "default")
    pub variant: String,

    /// Output format
    pub format: ImageFormat,
}

impl CacheKey {
    pub fn new(media_type: String, image_id: String, variant: String, format: ImageFormat) -> Self {
        Self {
            media_type,
            image_id,
            variant,
            format,
        }
    }

    /// Get the file path for this cache key
    /// Format: {base_path}/{media_type}/{image_id}/{variant}.{ext}
    pub fn to_path(&self, base_path: &Path) -> PathBuf {
        let extension = self.format.extension();
        base_path
            .join(&self.media_type)
            .join(&self.image_id)
            .join(format!("{}.{}", self.variant, extension))
    }

    /// Create a string representation for use as a lookup key
    pub fn to_string_key(&self) -> String {
        format!(
            "{}/{}/{}",
            self.media_type, self.image_id, self.variant
        )
    }
}

/// Filesystem-based image cache implementation
pub struct FilesystemCache {
    base_path: PathBuf,
}

impl FilesystemCache {
    /// Create a new filesystem cache
    pub fn new<P: Into<PathBuf>>(base_path: P) -> Self {
        Self {
            base_path: base_path.into(),
        }
    }

    /// Ensure the directory structure exists for a cache key
    fn ensure_dir(&self, key: &CacheKey) -> Result<(), CacheError> {
        let path = key.to_path(&self.base_path);
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent)?;
        }
        Ok(())
    }
}

#[async_trait::async_trait]
impl ImageCache for FilesystemCache {
    async fn get(&self, key: &CacheKey) -> Result<Option<Vec<u8>>, CacheError> {
        let path = key.to_path(&self.base_path);

        match tokio::fs::read(&path).await {
            Ok(data) => Ok(Some(data)),
            Err(e) if e.kind() == io::ErrorKind::NotFound => Ok(None),
            Err(e) => Err(CacheError::ReadError(path, e)),
        }
    }

    async fn set(&self, key: &CacheKey, data: &[u8]) -> Result<(), CacheError> {
        self.ensure_dir(key)?;

        let path = key.to_path(&self.base_path);
        tokio::fs::write(&path, data)
            .await
            .map_err(|e| CacheError::WriteError(path, e))?;

        Ok(())
    }

    async fn exists(&self, key: &CacheKey) -> Result<bool, CacheError> {
        let path = key.to_path(&self.base_path);
        Ok(tokio::fs::try_exists(&path).await.unwrap_or(false))
    }

    async fn delete(&self, key: &CacheKey) -> Result<(), CacheError> {
        let path = key.to_path(&self.base_path);

        match tokio::fs::remove_file(&path).await {
            Ok(()) => Ok(()),
            Err(e) if e.kind() == io::ErrorKind::NotFound => Ok(()), // Already deleted
            Err(e) => Err(CacheError::DeleteError(path, e)),
        }
    }

    async fn clear(&self) -> Result<(), CacheError> {
        // Remove the entire cache directory and recreate it
        if self.base_path.exists() {
            tokio::fs::remove_dir_all(&self.base_path)
                .await
                .map_err(|e| CacheError::ClearError(self.base_path.clone(), e))?;
        }

        tokio::fs::create_dir_all(&self.base_path)
            .await
            .map_err(|e| CacheError::ClearError(self.base_path.clone(), e))?;

        Ok(())
    }
}

/// Errors that can occur during caching operations
#[derive(Debug)]
pub enum CacheError {
    ReadError(PathBuf, io::Error),
    WriteError(PathBuf, io::Error),
    DeleteError(PathBuf, io::Error),
    ClearError(PathBuf, io::Error),
    IoError(io::Error),
}

impl std::fmt::Display for CacheError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            CacheError::ReadError(path, e) => {
                write!(f, "Failed to read cache file {}: {}", path.display(), e)
            }
            CacheError::WriteError(path, e) => {
                write!(f, "Failed to write cache file {}: {}", path.display(), e)
            }
            CacheError::DeleteError(path, e) => {
                write!(f, "Failed to delete cache file {}: {}", path.display(), e)
            }
            CacheError::ClearError(path, e) => {
                write!(f, "Failed to clear cache directory {}: {}", path.display(), e)
            }
            CacheError::IoError(e) => write!(f, "I/O error: {}", e),
        }
    }
}

impl std::error::Error for CacheError {}

impl From<io::Error> for CacheError {
    fn from(err: io::Error) -> Self {
        CacheError::IoError(err)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    #[tokio::test]
    async fn test_cache_key_to_path() {
        let key = CacheKey::new(
            "profile".to_string(),
            "abc123".to_string(),
            "thumbnail".to_string(),
            ImageFormat::WebP,
        );

        let base = Path::new("/cache");
        let path = key.to_path(base);

        assert_eq!(
            path,
            PathBuf::from("/cache/profile/abc123/thumbnail.webp")
        );
    }

    #[tokio::test]
    async fn test_filesystem_cache() {
        let temp_dir = TempDir::new().unwrap();
        let cache = FilesystemCache::new(temp_dir.path());

        let key = CacheKey::new(
            "profile".to_string(),
            "test123".to_string(),
            "default".to_string(),
            ImageFormat::Jpeg,
        );

        // Should not exist initially
        assert!(!cache.exists(&key).await.unwrap());
        assert_eq!(cache.get(&key).await.unwrap(), None);

        // Set data
        let data = b"fake image data";
        cache.set(&key, data).await.unwrap();

        // Should now exist
        assert!(cache.exists(&key).await.unwrap());

        // Get data
        let retrieved = cache.get(&key).await.unwrap().unwrap();
        assert_eq!(retrieved, data);

        // Delete
        cache.delete(&key).await.unwrap();
        assert!(!cache.exists(&key).await.unwrap());
    }

    #[tokio::test]
    async fn test_cache_clear() {
        let temp_dir = TempDir::new().unwrap();
        let cache = FilesystemCache::new(temp_dir.path());

        // Create multiple cached items
        for i in 0..3 {
            let key = CacheKey::new(
                "profile".to_string(),
                format!("image{}", i),
                "default".to_string(),
                ImageFormat::WebP,
            );
            cache.set(&key, b"data").await.unwrap();
        }

        // Clear cache
        cache.clear().await.unwrap();

        // Verify all items are gone
        for i in 0..3 {
            let key = CacheKey::new(
                "profile".to_string(),
                format!("image{}", i),
                "default".to_string(),
                ImageFormat::WebP,
            );
            assert!(!cache.exists(&key).await.unwrap());
        }
    }
}
