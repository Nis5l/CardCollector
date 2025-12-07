use std::path::Path;
use rocket::State;
use rocket::{fs::NamedFile, http::Status};

use crate::config::Config;
use crate::shared::image::ImageResponse;

#[get("/collector/collector-image")]
pub async fn collector_image_default_route(config: &State<Config>) -> ImageResponse {
    let file = match NamedFile::open(Path::new(&config.collector_fs_base).join("collector-image-default")).await {
        Ok(file) => file,
        Err(_) => return ImageResponse::api_err(Status::InternalServerError, String::from("Default image not found"))
    };

    ImageResponse::ok(Status::Ok, file)
}
