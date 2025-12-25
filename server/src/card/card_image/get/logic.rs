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
    let (card_id, fallback_card_id): (Id, Option<Id>) = match card::sql::get_card(sql, None, &card_id).await {
        Ok(Some(card)) => (card.card_info.id, card.update_card.as_ref().map(|boxed| boxed.card_info.id.clone())),
        Ok(None) => match card::sql::get_card_delete_request(sql, &card_id).await {
            Ok(Some(card_id)) => (card_id, None),
            Ok(None) => return ImageResponse::api_err(Status::NotFound, format!("card with id {} not found", card_id)),
            Err(_) => return ImageResponse::api_err(Status::InternalServerError, String::from("database error"))
        },
        Err(_) => return ImageResponse::api_err(Status::InternalServerError, String::from("database error"))
    };

    let path = Path::new(&config.card_fs_base);

    let file = match NamedFile::open(path.join(card_id.to_string()).join("card-image")).await {
        Ok(file) => file,
        Err(_) => {
            let file = match fallback_card_id {
                Some(fallback_card_id) => match NamedFile::open(path.join(fallback_card_id.to_string()).join("card-image")).await {
                    Ok(file) => Some(file),
                    Err(_) => None,
                },
                None => None
            };
            match file {
                Some(file) => file,
                None => match NamedFile::open(path.join("card-image-default")).await {
                    Ok(file) => file,
                    Err(_) => return ImageResponse::api_err(Status::InternalServerError, String::from("default image not found"))
                }
            }
        }
    };

    ImageResponse::ok(Status::Ok, file)
}
