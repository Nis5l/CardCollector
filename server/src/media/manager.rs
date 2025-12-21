use std::collections::HashMap;
use std::sync::Arc;
use dashmap::DashMap;
use tokio::sync::Mutex;
use opencv::core::{Mat, Vector};
use opencv::prelude::*;
use opencv::imgcodecs::{imencode, imdecode, IMREAD_COLOR};
use opencv::imgcodecs::{IMWRITE_WEBP_QUALITY, IMWRITE_JPEG_QUALITY, IMWRITE_PNG_COMPRESSION};

use super::effect::{ImageEffect, ImageFormat, EffectParams, EffectError};
use super::effect_registry::EffectRegistry;
use super::config::{MediaTypeConfig, EffectSpec};
use super::cache::{ImageCache, CacheKey, CacheError};
use super::storage::{ImageStorage, StorageError};

/// Main media manager coordinating image transformations and caching
pub struct MediaManager {
    effect_registry: Arc<EffectRegistry>,
    media_types: HashMap<String, MediaTypeConfig>,
    cache: Arc<dyn ImageCache>,
    storage: Arc<ImageStorage>,

    /// Per-cache-key locks for thread-safe generation
    generation_locks: Arc<DashMap<String, Arc<Mutex<()>>>>,
}

impl MediaManager {
    /// Create a new MediaManager
    pub fn new(
        effect_registry: EffectRegistry,
        media_types: HashMap<String, MediaTypeConfig>,
        cache: Arc<dyn ImageCache>,
        storage: Arc<ImageStorage>,
    ) -> Self {
        Self {
            effect_registry: Arc::new(effect_registry),
            media_types,
            cache,
            storage,
            generation_locks: Arc::new(DashMap::new()),
        }
    }

    /// Get a transformed image variant
    ///
    /// Returns the image bytes and the actual format
    pub async fn get_image(
        &self,
        media_type: &str,
        image_id: &str,
        variant: Option<&str>,
    ) -> Result<(Vec<u8>, ImageFormat), ManagerError> {
        let variant_name = variant.unwrap_or("default");

        // Get media type config
        let media_config = self.media_types
            .get(media_type)
            .ok_or_else(|| ManagerError::UnknownMediaType(media_type.to_string()))?;

        // Get variant config
        let variant_config = media_config.variants
            .get(variant_name)
            .ok_or_else(|| ManagerError::UnknownVariant(variant_name.to_string()))?;

        // Determine output format by scanning effect chain
        let format = self.determine_format(&variant_config.effects);

        // Create cache key
        let cache_key = CacheKey::new(
            media_type.to_string(),
            image_id.to_string(),
            variant_name.to_string(),
            format,
        );

        // Fast path: check cache without lock
        if let Some(cached) = self.cache.get(&cache_key).await? {
            return Ok((cached, format));
        }

        // Get or create generation lock for this specific cache key
        let lock_key = cache_key.to_string_key();
        let lock = self.generation_locks
            .entry(lock_key.clone())
            .or_insert_with(|| Arc::new(Mutex::new(())))
            .clone();

        // Acquire lock - ensures only one generation at a time for this key
        let _guard = lock.lock().await;

        // Double-check: maybe generated while waiting for lock
        if let Some(cached) = self.cache.get(&cache_key).await? {
            return Ok((cached, format));
        }

        // We're the first - generate the variant
        let bytes = self.generate_variant(image_id, &variant_config.effects, format).await?;

        // Cache the result
        self.cache.set(&cache_key, &bytes).await?;

        // Clean up lock entry if possible (optional optimization)
        // Keep lock in map for now - it's cheap memory-wise

        Ok((bytes, format))
    }

    /// Generate a variant by applying the effect chain
    async fn generate_variant(
        &self,
        image_id: &str,
        effects: &[EffectSpec],
        output_format: ImageFormat,
    ) -> Result<Vec<u8>, ManagerError> {
        // Load original image
        let original_bytes = self.storage.retrieve(image_id).await?;

        // Decode image using OpenCV
        let buffer = Vector::<u8>::from_slice(&original_bytes);
        let mut image = imdecode(&buffer, IMREAD_COLOR)?;

        // Apply effect chain
        for effect_spec in effects {
            let effect = self.effect_registry
                .get(&effect_spec.id)
                .ok_or_else(|| ManagerError::UnknownEffect(effect_spec.id.clone()))?;

            // Create effect params
            let params = EffectParams::new(effect_spec.params.clone());

            // Apply effect
            image = effect.apply(image, &params)?;
        }

        // Encode to output format
        let bytes = self.encode_image(image, output_format, effects)?;

        Ok(bytes)
    }

    /// Encode image to bytes in the specified format
    fn encode_image(
        &self,
        image: Mat,
        format: ImageFormat,
        effects: &[EffectSpec],
    ) -> Result<Vec<u8>, ManagerError> {
        let mut encoded_buffer = Vector::<u8>::new();
        let mut params = Vector::<i32>::new();

        match format {
            ImageFormat::Jpeg => {
                let quality = self.extract_quality_param(effects, "jpeg").unwrap_or(85);
                params.push(IMWRITE_JPEG_QUALITY);
                params.push(quality as i32);
                imencode(".jpg", &image, &mut encoded_buffer, &params)?;
            }
            ImageFormat::Png => {
                let compression = self.extract_compression_param(effects).unwrap_or(6);
                params.push(IMWRITE_PNG_COMPRESSION);
                params.push(compression as i32);
                imencode(".png", &image, &mut encoded_buffer, &params)?;
            }
            ImageFormat::WebP => {
                let quality = self.extract_quality_param(effects, "webp").unwrap_or(90);
                params.push(IMWRITE_WEBP_QUALITY);
                params.push(quality as i32);
                imencode(".webp", &image, &mut encoded_buffer, &params)?;
            }
            ImageFormat::Avif => {
                // AVIF not yet supported by OpenCV - would need separate library
                // For now, fall back to WebP
                let quality = self.extract_quality_param(effects, "avif").unwrap_or(80);
                params.push(IMWRITE_WEBP_QUALITY);
                params.push(quality as i32);
                imencode(".webp", &image, &mut encoded_buffer, &params)?;
            }
        }

        Ok(encoded_buffer.to_vec())
    }

    /// Determine output format by scanning effect chain
    fn determine_format(&self, effects: &[EffectSpec]) -> ImageFormat {
        let mut format = ImageFormat::Jpeg; // Default

        for effect_spec in effects {
            if let Some(effect) = self.effect_registry.get(&effect_spec.id) {
                if let Some(new_format) = effect.output_format() {
                    format = new_format;
                }
            }
        }

        format
    }

    /// Extract quality parameter from effect chain (for JPEG/WebP)
    fn extract_quality_param(&self, effects: &[EffectSpec], effect_id: &str) -> Option<u32> {
        effects
            .iter()
            .find(|e| e.id == effect_id)
            .and_then(|e| e.params.get("quality"))
            .and_then(|v| v.as_u64())
            .map(|v| v as u32)
    }

    /// Extract compression parameter from effect chain (for PNG)
    fn extract_compression_param(&self, effects: &[EffectSpec]) -> Option<u32> {
        effects
            .iter()
            .find(|e| e.id == "png")
            .and_then(|e| e.params.get("compression"))
            .and_then(|v| v.as_u64())
            .map(|v| v as u32)
    }

    /// Upload a new image and return its hash-based ID
    pub async fn upload_image(&self, data: &[u8]) -> Result<String, ManagerError> {
        let image_id = self.storage.store(data).await?;
        Ok(image_id)
    }

    /// Get information about all variants for a media type and image
    pub fn get_media_info(
        &self,
        media_type: &str,
        image_id: &str,
    ) -> Result<MediaInfo, ManagerError> {
        let media_config = self.media_types
            .get(media_type)
            .ok_or_else(|| ManagerError::UnknownMediaType(media_type.to_string()))?;

        let mut variants = Vec::new();

        for (variant_name, variant_config) in &media_config.variants {
            let format = self.determine_format(&variant_config.effects);

            variants.push(VariantInfo {
                name: variant_name.clone(),
                url: format!("/media/{}/{}/{}", media_type, image_id, variant_name),
                width: variant_config.metadata.width,
                height: variant_config.metadata.height,
                format: format.to_string(),
                breakpoint: variant_config.breakpoint,
            });
        }

        Ok(MediaInfo {
            media_type: media_type.to_string(),
            image_id: image_id.to_string(),
            default_variant: media_config.default_variant.clone(),
            variants,
        })
    }
}

/// Information about all variants of a media type
#[derive(Debug, Clone, serde::Serialize)]
pub struct MediaInfo {
    #[serde(rename = "type")]
    pub media_type: String,
    #[serde(rename = "imageId")]
    pub image_id: String,
    #[serde(rename = "defaultVariant")]
    pub default_variant: String,
    pub variants: Vec<VariantInfo>,
}

/// Information about a single variant
#[derive(Debug, Clone, serde::Serialize)]
pub struct VariantInfo {
    pub name: String,
    pub url: String,
    pub width: u32,
    pub height: u32,
    pub format: String,
    pub breakpoint: Option<u32>,
}

/// Errors that can occur in the MediaManager
#[derive(Debug)]
pub enum ManagerError {
    UnknownMediaType(String),
    UnknownVariant(String),
    UnknownEffect(String),
    CacheError(CacheError),
    StorageError(StorageError),
    EffectError(EffectError),
    OpenCVError(opencv::Error),
}

impl std::fmt::Display for ManagerError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ManagerError::UnknownMediaType(t) => write!(f, "Unknown media type: {}", t),
            ManagerError::UnknownVariant(v) => write!(f, "Unknown variant: {}", v),
            ManagerError::UnknownEffect(e) => write!(f, "Unknown effect: {}", e),
            ManagerError::CacheError(e) => write!(f, "Cache error: {}", e),
            ManagerError::StorageError(e) => write!(f, "Storage error: {}", e),
            ManagerError::EffectError(e) => write!(f, "Effect error: {}", e),
            ManagerError::OpenCVError(e) => write!(f, "OpenCV error: {}", e),
        }
    }
}

impl std::error::Error for ManagerError {}

impl From<CacheError> for ManagerError {
    fn from(err: CacheError) -> Self {
        ManagerError::CacheError(err)
    }
}

impl From<StorageError> for ManagerError {
    fn from(err: StorageError) -> Self {
        ManagerError::StorageError(err)
    }
}

impl From<EffectError> for ManagerError {
    fn from(err: EffectError) -> Self {
        ManagerError::EffectError(err)
    }
}

impl From<opencv::Error> for ManagerError {
    fn from(err: opencv::Error) -> Self {
        ManagerError::OpenCVError(err)
    }
}
