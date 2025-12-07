use std::path::PathBuf;
use super::resize_image_to_ratio;

pub fn resize_image_banner(path: PathBuf){
    resize_image_to_ratio(path, ".jpg", 4000, 500);
}
