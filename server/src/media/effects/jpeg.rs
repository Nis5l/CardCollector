use opencv::core::Mat;
use crate::media::effect::{ImageEffect, EffectParams, EffectError, ImageFormat};

/// Convert image to JPEG format
///
/// This effect doesn't modify the image pixels - it just marks that the output
/// should be encoded as JPEG. The actual encoding happens in the MediaManager.
pub struct JpegEffect;

impl ImageEffect for JpegEffect {
    fn id(&self) -> &'static str {
        "jpeg"
    }

    fn apply(&self, image: Mat, _params: &EffectParams) -> Result<Mat, EffectError> {
        // No pixel transformation - just pass through
        // The format change is signaled via output_format()
        Ok(image)
    }

    fn output_format(&self) -> Option<ImageFormat> {
        Some(ImageFormat::Jpeg)
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

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;

    #[test]
    fn test_output_format() {
        let effect = JpegEffect;
        assert_eq!(effect.output_format(), Some(ImageFormat::Jpeg));
    }

    #[test]
    fn test_validate_params() {
        let effect = JpegEffect;

        // Valid: no params
        let params = EffectParams::new(HashMap::new());
        assert!(effect.validate_params(&params).is_ok());

        // Valid: quality in range
        let mut params_map = HashMap::new();
        params_map.insert("quality".to_string(), serde_json::json!(85));
        let params = EffectParams::new(params_map);
        assert!(effect.validate_params(&params).is_ok());

        // Invalid: quality out of range
        let mut params_map = HashMap::new();
        params_map.insert("quality".to_string(), serde_json::json!(0));
        let params = EffectParams::new(params_map);
        assert!(effect.validate_params(&params).is_err());
    }
}
