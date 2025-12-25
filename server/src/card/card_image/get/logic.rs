use rocket::State;
use rocket::http::{Status, ContentType};

use crate::sql::Sql;
use crate::media::MediaManager;
use crate::shared::Id;
use crate::shared::card;

//NOTE: this collides with /card/unlocked/<card_unlocked_id>
#[get("/card/<card_id>/card-image", rank=1)]
pub async fn card_image_get_route(card_id: Id, sql: &State<Sql>, media_manager: &State<MediaManager>) -> Result<(ContentType, Vec<u8>), Status> {
    //NOTE: check card_id to avoid path traversal attacks or similar
    let (card_id, fallback_card_id): (Id, Option<Id>) = match card::sql::get_card(sql, None, &card_id).await {
        Ok(Some(card)) => (card.card_info.id, card.update_card.as_ref().map(|boxed| boxed.card_info.id.clone())),
        Ok(None) => match card::sql::get_card_delete_request(sql, &card_id).await {
            Ok(Some(card_id)) => (card_id, None),
            Ok(None) => return Err(Status::NotFound),
            Err(_) => return Err(Status::InternalServerError)
        },
        Err(_) => return Err(Status::InternalServerError)
    };


    // Get image hash from database
    let image_hash = match card::sql::get_card_image(sql, &card_id).await {
        Ok(Some(hash)) => hash,
        Ok(None) => match fallback_card_id {
            Some(fallback_card_id) => match card::sql::get_card_image(sql, &fallback_card_id).await {
                Ok(Some(hash)) => hash,
                Ok(None) => String::from("card-image-default"),
                Err(_) => return Err(Status::InternalServerError)
            },
            None => String::from("card-image-default")
        },
        Err(_) => return Err(Status::InternalServerError)
    };

    // Get image through MediaManager with "card" media type
    let (bytes, format) = media_manager
        .get_image("card", &image_hash, None)
        .await
        .map_err(|_| Status::NotFound)?;

    // Parse Content-Type based on format
    let content_type = ContentType::parse_flexible(format.mime_type())
        .unwrap_or(ContentType::Binary);

    Ok((content_type, bytes))
}
