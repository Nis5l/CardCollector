use std::path::Path;
use rocket::State;
use rocket::{fs::NamedFile, http::Status};

use crate::config::Config;
use crate::sql::Sql;
use crate::shared::Id;
use crate::shared::card;
use crate::shared::image::ImageResponse;

//NOTE: this collides with /card/unlocked/<card_unlocked_id>
#[get("/card/<card_id>/card-image", rank=1)]
pub async fn card_image_get_route(card_id: Id, sql: &State<Sql>, config: &State<Config>) -> ImageResponse {
    //NOTE: check card_id to avoid path traversal attacks or similar
    let card_id = match card::sql::card_exists(sql, &card_id).await {
        Ok(true) => card_id,
        Ok(false) => match card::sql::get_card_delete_request(sql, &card_id).await {
            Ok(Some(card_id)) => card_id,
            Ok(None) => return ImageResponse::api_err(Status::NotFound, format!("card with id {} not found", card_id)),
            Err(_) => return ImageResponse::api_err(Status::InternalServerError, String::from("database error"))
        },
        Err(_) => return ImageResponse::api_err(Status::InternalServerError, String::from("database error"))
    };

    let path = Path::new(&config.card_fs_base);

    let file = match NamedFile::open(path.join(card_id.to_string()).join("card-image")).await {
        Ok(file) => file,
        Err(_) => match NamedFile::open(path.join("card-image-default")).await {
            Ok(file) => file,
            Err(_) => return ImageResponse::api_err(Status::InternalServerError, String::from("default image not found"))
        }
    };

    ImageResponse::ok(Status::Ok, file)
}
