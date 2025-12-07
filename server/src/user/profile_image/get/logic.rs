use std::path::Path;
use rocket::State;
use rocket::{fs::NamedFile, http::Status};

use crate::config::Config;
use crate::sql::Sql;
use crate::shared::Id;
use crate::shared::user;
use crate::shared::image::ImageResponse;

#[get("/user/<user_id>/profile-image")]
pub async fn profile_image_get_route(user_id: Id, sql: &State<Sql>, config: &State<Config>) -> ImageResponse {
    //NOTE: check user_id to avoid path traversal attacks or similar
    match user::sql::username_from_user_id(sql, &user_id).await {
        Ok(Some(_)) => (),
        Ok(None) => return ImageResponse::api_err(Status::NotFound, String::from("User not found")),
        Err(_) => return ImageResponse::api_err(Status::InternalServerError, String::from("Database error"))
    }

    let path = Path::new(&config.user_fs_base);

    let file = match NamedFile::open(path.join(user_id.to_string()).join("profile-image")).await {
        Ok(file) => file,
        Err(_) => match NamedFile::open(path.join("profile-image-default")).await {
            Ok(file) => file,
            Err(_) => return ImageResponse::api_err(Status::InternalServerError, String::from("Default image not found"))
        }
    };

    ImageResponse::ok(Status::Ok, file)
}
