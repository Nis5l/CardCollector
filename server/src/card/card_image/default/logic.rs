use std::path::Path;
use rocket::State;
use rocket::{fs::NamedFile, http::Status};

use crate::config::Config;
use crate::shared::image::ImageResponse;

#[get("/card/card-image")]
pub async fn card_image_default_route(config: &State<Config>) -> ImageResponse {
    let file = match NamedFile::open(Path::new(&config.card_fs_base).join("card-image-default")).await {
        Ok(file) => file,
        Err(_) => return ImageResponse::api_err(Status::InternalServerError, String::from("default image not found"))
    };

    ImageResponse::ok(Status::Ok, file)
}
