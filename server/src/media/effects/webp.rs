use opencv::core::Mat;
use crate::media::effect::{ImageEffect, EffectParams, EffectError, ImageFormat};

/// Convert image to WebP format
///
/// This effect doesn't modify the image pixels - it just marks that the output
/// should be encoded as WebP. The actual encoding happens in the MediaManager.
pub struct WebPEffect;

impl ImageEffect for WebPEffect {
    fn id(&self) -> &'static str {
        "webp"
    }

    fn apply(&self, image: Mat, _params: &EffectParams) -> Result<Mat, EffectError> {
        // No pixel transformation - just pass through
        // The format change is signaled via output_format()
        Ok(image)
    }

    fn output_format(&self) -> Option<ImageFormat> {
        Some(ImageFormat::WebP)
    }

    fn validate_params(&self, params: &EffectParams) -> Result<(), EffectError> {
        // Quality parameter is optional, but if provided should be 1-100
        if let Ok(quality) = params.get_u32("quality") {
            if quality < 1 || quality > 100 {
                return Err(EffectError::InvalidParameter(
                    "quality must be between 1 and 100".to_string()
                ));
            }
        }

        // Lossless parameter is optional boolean
        if let Ok(_lossless) = params.get_bool("lossless") {
            // Valid boolean
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;

    #[test]
    fn test_output_format() {
        let effect = WebPEffect;
        assert_eq!(effect.output_format(), Some(ImageFormat::WebP));
    }

    #[test]
    fn test_validate_params() {
        let effect = WebPEffect;

        // Valid: no params (quality is optional)
        let params = EffectParams::new(HashMap::new());
        assert!(effect.validate_params(&params).is_ok());

        // Valid: quality in range
        let mut params_map = HashMap::new();
        params_map.insert("quality".to_string(), serde_json::json!(90));
        let params = EffectParams::new(params_map);
        assert!(effect.validate_params(&params).is_ok());

        // Invalid: quality out of range
        let mut params_map = HashMap::new();
        params_map.insert("quality".to_string(), serde_json::json!(150));
        let params = EffectParams::new(params_map);
        assert!(effect.validate_params(&params).is_err());

        // Valid: lossless flag
        let mut params_map = HashMap::new();
        params_map.insert("lossless".to_string(), serde_json::json!(true));
        let params = EffectParams::new(params_map);
        assert!(effect.validate_params(&params).is_ok());
    }
}
