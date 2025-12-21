use opencv::core::{Mat, Rect, Size};
use opencv::imgproc::{resize, INTER_LINEAR};
use opencv::prelude::*;
use crate::media::effect::{ImageEffect, EffectParams, EffectError, ImageFormat};

/// Resize image to a specific aspect ratio, cropping center if needed
pub struct ResizeRatioEffect;

impl ImageEffect for ResizeRatioEffect {
    fn id(&self) -> &'static str {
        "resize_ratio"
    }

    fn apply(&self, image: Mat, params: &EffectParams) -> Result<Mat, EffectError> {
        let target_width = params.get_i32("width")?;
        let target_height = params.get_i32("height")?;

        if target_width <= 0 || target_height <= 0 {
            return Err(EffectError::InvalidParameter(
                "width and height must be positive".to_string()
            ));
        }

        let (width, height) = {
            let img_size = image.size()?;
            (img_size.width, img_size.height)
        };

        let actual_ratio = width as f32 / height as f32;
        let target_ratio = target_width as f32 / target_height as f32;

        // Crop to target ratio if needed
        let cropped_image = if !is_close::default().is_close(actual_ratio, target_ratio) {
            let (from_height, from_width, roi_width, roi_height) = if actual_ratio > target_ratio {
                // Image is wider than target - crop width
                let roi_width = (target_ratio * height as f32) as i32;
                let from_width = (width - roi_width) / 2;
                (0, from_width, roi_width, height)
            } else {
                // Image is taller than target - crop height
                let roi_height = (width as f32 / target_ratio) as i32;
                let from_height = (height - roi_height) / 2;
                (from_height, 0, width, roi_height)
            };

            let roi = Mat::roi(
                &image,
                Rect {
                    x: from_width,
                    y: from_height,
                    width: roi_width,
                    height: roi_height,
                },
            )?;

            // Clone the ROI to get an owned Mat
            roi.try_clone()?
        } else {
            image
        };

        // Resize to target dimensions
        let mut resized = Mat::default();
        resize(
            &cropped_image,
            &mut resized,
            Size {
                width: target_width,
                height: target_height,
            },
            0.0,
            0.0,
            INTER_LINEAR,
        )?;

        Ok(resized)
    }

    fn validate_params(&self, params: &EffectParams) -> Result<(), EffectError> {
        let width = params.get_i32("width")?;
        let height = params.get_i32("height")?;

        if width <= 0 || height <= 0 {
            return Err(EffectError::InvalidParameter(
                "width and height must be positive".to_string()
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
        let effect = ResizeRatioEffect;

        // Valid params
        let mut params_map = HashMap::new();
        params_map.insert("width".to_string(), serde_json::json!(330));
        params_map.insert("height".to_string(), serde_json::json!(516));
        let params = EffectParams::new(params_map);
        assert!(effect.validate_params(&params).is_ok());

        // Invalid: missing width
        let mut params_map = HashMap::new();
        params_map.insert("height".to_string(), serde_json::json!(516));
        let params = EffectParams::new(params_map);
        assert!(effect.validate_params(&params).is_err());

        // Invalid: negative dimensions
        let mut params_map = HashMap::new();
        params_map.insert("width".to_string(), serde_json::json!(-330));
        params_map.insert("height".to_string(), serde_json::json!(516));
        let params = EffectParams::new(params_map);
        assert!(effect.validate_params(&params).is_err());
    }
}
