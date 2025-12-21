use std::collections::HashMap;
use std::fmt;
use opencv::core::Mat;
use rocket::serde::json::serde_json;

/// Supported image formats
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum ImageFormat {
    Jpeg,
    Png,
    WebP,
    Avif,
}

impl ImageFormat {
    /// Get file extension for this format
    pub fn extension(&self) -> &'static str {
        match self {
            ImageFormat::Jpeg => "jpg",
            ImageFormat::Png => "png",
            ImageFormat::WebP => "webp",
            ImageFormat::Avif => "avif",
        }
    }

    /// Get MIME type for this format
    pub fn mime_type(&self) -> &'static str {
        match self {
            ImageFormat::Jpeg => "image/jpeg",
            ImageFormat::Png => "image/png",
            ImageFormat::WebP => "image/webp",
            ImageFormat::Avif => "image/avif",
        }
    }

    /// Get OpenCV file type extension for encoding
    pub fn opencv_extension(&self) -> &'static str {
        match self {
            ImageFormat::Jpeg => ".jpg",
            ImageFormat::Png => ".png",
            ImageFormat::WebP => ".webp",
            ImageFormat::Avif => ".avif",
        }
    }
}

impl fmt::Display for ImageFormat {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ImageFormat::Jpeg => write!(f, "jpeg"),
            ImageFormat::Png => write!(f, "png"),
            ImageFormat::WebP => write!(f, "webp"),
            ImageFormat::Avif => write!(f, "avif"),
        }
    }
}

/// Parameters passed to image effects
#[derive(Debug, Clone)]
pub struct EffectParams {
    params: HashMap<String, serde_json::Value>,
}

impl EffectParams {
    pub fn new(params: HashMap<String, serde_json::Value>) -> Self {
        Self { params }
    }

    /// Get a u32 parameter
    pub fn get_u32(&self, key: &str) -> Result<u32, EffectError> {
        self.params
            .get(key)
            .and_then(|v| v.as_u64())
            .map(|v| v as u32)
            .ok_or_else(|| EffectError::MissingParameter(key.to_string()))
    }

    /// Get an i32 parameter
    pub fn get_i32(&self, key: &str) -> Result<i32, EffectError> {
        self.params
            .get(key)
            .and_then(|v| v.as_i64())
            .map(|v| v as i32)
            .ok_or_else(|| EffectError::MissingParameter(key.to_string()))
    }

    /// Get an f32 parameter
    pub fn get_f32(&self, key: &str) -> Result<f32, EffectError> {
        self.params
            .get(key)
            .and_then(|v| v.as_f64())
            .map(|v| v as f32)
            .ok_or_else(|| EffectError::MissingParameter(key.to_string()))
    }

    /// Get a boolean parameter
    pub fn get_bool(&self, key: &str) -> Result<bool, EffectError> {
        self.params
            .get(key)
            .and_then(|v| v.as_bool())
            .ok_or_else(|| EffectError::MissingParameter(key.to_string()))
    }

    /// Get a string parameter
    pub fn get_string(&self, key: &str) -> Result<String, EffectError> {
        self.params
            .get(key)
            .and_then(|v| v.as_str())
            .map(|v| v.to_string())
            .ok_or_else(|| EffectError::MissingParameter(key.to_string()))
    }
}

/// Errors that can occur during effect application
#[derive(Debug)]
pub enum EffectError {
    MissingParameter(String),
    InvalidParameter(String),
    OpenCVError(opencv::Error),
    ProcessingError(String),
}

impl fmt::Display for EffectError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            EffectError::MissingParameter(param) => {
                write!(f, "Missing required parameter: {}", param)
            }
            EffectError::InvalidParameter(msg) => write!(f, "Invalid parameter: {}", msg),
            EffectError::OpenCVError(e) => write!(f, "OpenCV error: {}", e),
            EffectError::ProcessingError(msg) => write!(f, "Processing error: {}", msg),
        }
    }
}

impl std::error::Error for EffectError {}

impl From<opencv::Error> for EffectError {
    fn from(err: opencv::Error) -> Self {
        EffectError::OpenCVError(err)
    }
}

/// Trait for image transformation effects
pub trait ImageEffect: Send + Sync {
    /// Unique identifier for this effect
    fn id(&self) -> &'static str;

    /// Apply transformation to image
    ///
    /// Takes an OpenCV Mat and returns the transformed Mat
    fn apply(&self, image: Mat, params: &EffectParams) -> Result<Mat, EffectError>;

    /// Returns the output format if this effect changes it
    ///
    /// Only format conversion effects (webp, jpeg, png) return Some(format)
    fn output_format(&self) -> Option<ImageFormat> {
        None // Default: effect doesn't change format
    }

    /// Validate parameters (optional)
    fn validate_params(&self, _params: &EffectParams) -> Result<(), EffectError> {
        Ok(())
    }
}
