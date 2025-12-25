use std::collections::HashMap;
use std::path::Path;
use std::fs;
use serde::{Deserialize, Serialize};
use rocket::serde::json::serde_json;
use super::effect_registry::EffectRegistry;
use super::effect::ImageFormat;

/// A single effect specification in the effect chain
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EffectSpec {
    /// Effect ID (e.g., "resize_square", "webp")
    pub id: String,

    /// Effect parameters as JSON object
    #[serde(default)]
    pub params: HashMap<String, serde_json::Value>,
}

/// Metadata about a variant (dimensions, format info)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VariantMetadata {
    /// Width in pixels
    pub width: u32,

    /// Height in pixels
    pub height: u32,
}

/// Configuration for a single variant of a media type
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VariantConfig {
    /// Human-readable description
    #[serde(default)]
    pub description: String,

    /// Ordered list of effects to apply
    pub effects: Vec<EffectSpec>,

    /// Metadata about dimensions
    pub metadata: VariantMetadata,

    /// Breakpoint in pixels (for responsive images)
    /// null means no specific breakpoint (typically used for smallest variant)
    pub breakpoint: Option<u32>,
}

/// Configuration for a media type (e.g., "profile", "card", "banner")
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MediaTypeConfig {
    /// Name of the media type
    pub name: String,

    /// Human-readable description
    #[serde(default)]
    pub description: String,

    /// Name of the default variant to use
    #[serde(rename = "defaultVariant")]
    pub default_variant: String,

    /// Map of variant name to variant configuration
    pub variants: HashMap<String, VariantConfig>,
}

impl MediaTypeConfig {
    /// Load a media type configuration from a JSON file
    pub fn load_from_file<P: AsRef<Path>>(path: P) -> Result<Self, ConfigError> {
        let content = fs::read_to_string(path.as_ref())
            .map_err(|e| ConfigError::FileReadError(path.as_ref().to_path_buf(), e))?;

        let config: MediaTypeConfig = serde_json::from_str(&content)
            .map_err(|e| ConfigError::ParseError(path.as_ref().to_path_buf(), e))?;

        config.validate()?;

        Ok(config)
    }

    /// Validate the configuration
    fn validate(&self) -> Result<(), ConfigError> {
        // Check that default variant exists
        if !self.variants.contains_key(&self.default_variant) {
            return Err(ConfigError::ValidationError(format!(
                "Default variant '{}' not found in variants",
                self.default_variant
            )));
        }

        // Check that at least one variant exists
        if self.variants.is_empty() {
            return Err(ConfigError::ValidationError(
                "Media type must have at least one variant".to_string()
            ));
        }

        // Validate each variant
        for (name, variant) in &self.variants {
            if variant.effects.is_empty() {
                return Err(ConfigError::ValidationError(format!(
                    "Variant '{}' has no effects",
                    name
                )));
            }
        }

        Ok(())
    }

    /// Validate that all effects used in this config are registered
    pub fn validate_effects(&self, registry: &EffectRegistry) -> Result<(), ConfigError> {
        for (variant_name, variant) in &self.variants {
            for effect_spec in &variant.effects {
                if !registry.has(&effect_spec.id) {
                    return Err(ConfigError::ValidationError(format!(
                        "Unknown effect '{}' in variant '{}'",
                        effect_spec.id, variant_name
                    )));
                }
            }
        }
        Ok(())
    }

    /// Determine the output format for a variant by scanning its effect chain
    pub fn determine_format(&self, variant_name: &str, registry: &EffectRegistry) -> Option<ImageFormat> {
        let variant = self.variants.get(variant_name)?;

        let mut format = ImageFormat::Jpeg; // Default format

        // Scan effect chain for format conversion effects
        for effect_spec in &variant.effects {
            if let Some(effect) = registry.get(&effect_spec.id) {
                if let Some(new_format) = effect.output_format() {
                    format = new_format;
                }
            }
        }

        Some(format)
    }
}

/// Load all media type configurations from a directory
pub fn load_media_types<P: AsRef<Path>>(
    dir: P,
    registry: &EffectRegistry,
) -> Result<HashMap<String, MediaTypeConfig>, ConfigError> {
    let mut media_types = HashMap::new();

    let dir_path = dir.as_ref();
    if !dir_path.exists() {
        return Err(ConfigError::DirectoryNotFound(dir_path.to_path_buf()));
    }

    if !dir_path.is_dir() {
        return Err(ConfigError::NotADirectory(dir_path.to_path_buf()));
    }

    // Read all .json files in the directory
    for entry in fs::read_dir(dir_path)
        .map_err(|e| ConfigError::DirectoryReadError(dir_path.to_path_buf(), e))?
    {
        let entry = entry.map_err(|e| ConfigError::DirectoryReadError(dir_path.to_path_buf(), e))?;
        let path = entry.path();

        // Only process .json files
        if path.extension().and_then(|s| s.to_str()) == Some("json") {
            let config = MediaTypeConfig::load_from_file(&path)?;

            // Validate that all effects are registered
            config.validate_effects(registry)?;

            media_types.insert(config.name.clone(), config);
        }
    }

    if media_types.is_empty() {
        return Err(ConfigError::NoConfigsFound(dir_path.to_path_buf()));
    }

    Ok(media_types)
}

/// Errors that can occur when loading configuration
#[derive(Debug)]
pub enum ConfigError {
    FileReadError(std::path::PathBuf, std::io::Error),
    ParseError(std::path::PathBuf, serde_json::Error),
    ValidationError(String),
    DirectoryNotFound(std::path::PathBuf),
    NotADirectory(std::path::PathBuf),
    DirectoryReadError(std::path::PathBuf, std::io::Error),
    NoConfigsFound(std::path::PathBuf),
}

impl std::fmt::Display for ConfigError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ConfigError::FileReadError(path, e) => {
                write!(f, "Failed to read file {}: {}", path.display(), e)
            }
            ConfigError::ParseError(path, e) => {
                write!(f, "Failed to parse JSON in {}: {}", path.display(), e)
            }
            ConfigError::ValidationError(msg) => write!(f, "Validation error: {}", msg),
            ConfigError::DirectoryNotFound(path) => {
                write!(f, "Directory not found: {}", path.display())
            }
            ConfigError::NotADirectory(path) => {
                write!(f, "Not a directory: {}", path.display())
            }
            ConfigError::DirectoryReadError(path, e) => {
                write!(f, "Failed to read directory {}: {}", path.display(), e)
            }
            ConfigError::NoConfigsFound(path) => {
                write!(f, "No .json configuration files found in {}", path.display())
            }
        }
    }
}

impl std::error::Error for ConfigError {}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_effect_spec_deserialization() {
        let json = r#"{
            "id": "resize_square",
            "params": { "size": 500 }
        }"#;

        let spec: EffectSpec = serde_json::from_str(json).unwrap();
        assert_eq!(spec.id, "resize_square");
        assert_eq!(spec.params.get("size").unwrap().as_u64().unwrap(), 500);
    }

    #[test]
    fn test_variant_config_deserialization() {
        let json = r#"{
            "description": "Test variant",
            "effects": [
                { "id": "resize_square", "params": { "size": 150 } },
                { "id": "webp", "params": { "quality": 90 } }
            ],
            "metadata": { "width": 150, "height": 150 },
            "breakpoint": 768
        }"#;

        let config: VariantConfig = serde_json::from_str(json).unwrap();
        assert_eq!(config.effects.len(), 2);
        assert_eq!(config.metadata.width, 150);
        assert_eq!(config.breakpoint, Some(768));
    }

    #[test]
    fn test_media_type_validation() {
        let json = r#"{
            "name": "profile",
            "description": "User profile images",
            "defaultVariant": "default",
            "variants": {
                "default": {
                    "effects": [
                        { "id": "resize_square", "params": { "size": 500 } }
                    ],
                    "metadata": { "width": 500, "height": 500 },
                    "breakpoint": null
                }
            }
        }"#;

        let config: MediaTypeConfig = serde_json::from_str(json).unwrap();
        assert!(config.validate().is_ok());
    }

    #[test]
    fn test_invalid_default_variant() {
        let json = r#"{
            "name": "profile",
            "defaultVariant": "nonexistent",
            "variants": {
                "default": {
                    "effects": [{ "id": "resize_square", "params": { "size": 500 } }],
                    "metadata": { "width": 500, "height": 500 },
                    "breakpoint": null
                }
            }
        }"#;

        let config: MediaTypeConfig = serde_json::from_str(json).unwrap();
        assert!(config.validate().is_err());
    }
}
