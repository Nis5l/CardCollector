use opencv::core::Mat;
use crate::media::effect::{ImageEffect, EffectParams, EffectError, ImageFormat};

/// Convert image to PNG format
///
/// This effect doesn't modify the image pixels - it just marks that the output
/// should be encoded as PNG. The actual encoding happens in the MediaManager.
pub struct PngEffect;

impl ImageEffect for PngEffect {
    fn id(&self) -> &'static str {
        "png"
    }

    fn apply(&self, image: Mat, _params: &EffectParams) -> Result<Mat, EffectError> {
        // No pixel transformation - just pass through
        // The format change is signaled via output_format()
        Ok(image)
    }

    fn output_format(&self) -> Option<ImageFormat> {
        Some(ImageFormat::Png)
    }

    fn validate_params(&self, params: &EffectParams) -> Result<(), EffectError> {
        // Compression parameter is optional, but if provided should be 0-9
        if let Ok(compression) = params.get_u32("compression") {
            if compression > 9 {
                return Err(EffectError::InvalidParameter(
                    "compression must be between 0 and 9".to_string()
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
        let effect = PngEffect;
        assert_eq!(effect.output_format(), Some(ImageFormat::Png));
    }

    #[test]
    fn test_validate_params() {
        let effect = PngEffect;

        // Valid: no params
        let params = EffectParams::new(HashMap::new());
        assert!(effect.validate_params(&params).is_ok());

        // Valid: compression in range
        let mut params_map = HashMap::new();
        params_map.insert("compression".to_string(), serde_json::json!(6));
        let params = EffectParams::new(params_map);
        assert!(effect.validate_params(&params).is_ok());

        // Invalid: compression out of range
        let mut params_map = HashMap::new();
        params_map.insert("compression".to_string(), serde_json::json!(15));
        let params = EffectParams::new(params_map);
        assert!(effect.validate_params(&params).is_err());
    }
}
