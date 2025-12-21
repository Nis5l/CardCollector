use opencv::core::{Mat, Rect, Size};
use opencv::imgproc::{resize, INTER_LINEAR};
use opencv::prelude::*;
use crate::media::effect::{ImageEffect, EffectParams, EffectError, ImageFormat};

/// Resize image to a square, cropping center if aspect ratio doesn't match
pub struct ResizeSquareEffect;

impl ImageEffect for ResizeSquareEffect {
    fn id(&self) -> &'static str {
        "resize_square"
    }

    fn apply(&self, image: Mat, params: &EffectParams) -> Result<Mat, EffectError> {
        let size = params.get_i32("size")?;

        if size <= 0 {
            return Err(EffectError::InvalidParameter(
                "size must be positive".to_string()
            ));
        }

        let (width, height) = {
            let img_size = image.size()?;
            (img_size.width, img_size.height)
        };

        // Crop to square first if needed
        let square_image = if width != height {
            let square_size = width.min(height);
            let x_offset = (width - square_size) / 2;
            let y_offset = (height - square_size) / 2;

            let roi = Mat::roi(
                &image,
                Rect {
                    x: x_offset,
                    y: y_offset,
                    width: square_size,
                    height: square_size,
                },
            )?;

            // Clone the ROI to get an owned Mat
            roi.try_clone()?
        } else {
            image
        };

        // Resize to target size
        let mut resized = Mat::default();
        resize(
            &square_image,
            &mut resized,
            Size {
                width: size,
                height: size,
            },
            0.0,
            0.0,
            INTER_LINEAR,
        )?;

        Ok(resized)
    }

    fn validate_params(&self, params: &EffectParams) -> Result<(), EffectError> {
        let size = params.get_i32("size")?;
        if size <= 0 {
            return Err(EffectError::InvalidParameter(
                "size must be positive".to_string()
            ));
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;

    #[test]
    fn test_validate_params() {
        let effect = ResizeSquareEffect;

        // Valid params
        let mut params_map = HashMap::new();
        params_map.insert("size".to_string(), serde_json::json!(500));
        let params = EffectParams::new(params_map);
        assert!(effect.validate_params(&params).is_ok());

        // Invalid: missing size
        let params = EffectParams::new(HashMap::new());
        assert!(effect.validate_params(&params).is_err());

        // Invalid: negative size
        let mut params_map = HashMap::new();
        params_map.insert("size".to_string(), serde_json::json!(-100));
        let params = EffectParams::new(params_map);
        assert!(effect.validate_params(&params).is_err());
    }
}
