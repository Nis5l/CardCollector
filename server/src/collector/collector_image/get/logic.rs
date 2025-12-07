use std::path::Path;
use rocket::State;
use rocket::{fs::NamedFile, http::Status};

use crate::config::Config;
use crate::sql::Sql;
use crate::shared::Id;
use crate::shared::collector;
use crate::shared::image::ImageResponse;

#[get("/collector/<collector_id>/collector-image")]
pub async fn collector_image_get_route(collector_id: Id, sql: &State<Sql>, config: &State<Config>) -> ImageResponse {
    //NOTE: check collector_id to avoid path traversal attacks or similar
    match collector::sql::collector_exists(sql, &collector_id).await {
        Ok(true) => (),
        Ok(false) => return ImageResponse::api_err(Status::NotFound, format!("collector with id {} not found", collector_id)),
        Err(_) => return ImageResponse::api_err(Status::InternalServerError, String::from("database error"))
    }

    let path = Path::new(&config.collector_fs_base);

    let file = match NamedFile::open(path.join(collector_id.to_string()).join("collector-image")).await {
        Ok(file) => file,
        Err(_) => match NamedFile::open(path.join("collector-image-default")).await {
            Ok(file) => file,
            Err(_) => return ImageResponse::api_err(Status::InternalServerError, String::from("default image not found"))
        }
    };

    ImageResponse::ok(Status::Ok, file)
}
