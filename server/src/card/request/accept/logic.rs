use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::State;
use rocket::http::Status;
use std::fs;
use std::path::Path;

use super::sql;
use super::data::CardRequestAcceptResponse;
use crate::shared::Id;
use crate::shared::card;
use crate::sql::Sql;
use crate::config::Config;
use crate::{verify_collector_owner_moderator, verify_user};
use crate::shared::crypto::JwtToken;

#[post("/card/request/<card_id>/accept")]
pub async fn card_request_accept_route(card_id: Id, sql: &State<Sql>, token: JwtToken, config: &State<Config>) -> ApiResponseErr<CardRequestAcceptResponse> {
    let user_id = &token.id;

    verify_user!(sql, user_id, true);
    let collector_id = rjtry!(card::sql::get_card_collector_id(sql, &card_id).await);
    verify_collector_owner_moderator!(sql, &collector_id, user_id);

    let card = match rjtry!(card::sql::get_card(sql, &collector_id, &card_id).await) {
        Some(card) => card,
        None => return ApiResponseErr::api_err(Status::Conflict, String::from("Card not found"))
    };

    match card.update_card {
        Some(ref card_reference) => {
            rjtry!(sql::card_request_accept_update(sql, &card_reference.card_info.id, &card).await);

            let old_dir = Path::new(&config.card_fs_base).join(card.card_info.id.to_string());
            let old_path = old_dir.join("card-image");
            let new_dir = Path::new(&config.card_fs_base).join(card_reference.card_info.id.to_string());
            let new_path = new_dir.join("card-image");

            if let Err(_) = fs::create_dir_all(&new_dir) {
                return ApiResponseErr::api_err(Status::InternalServerError, String::from("Failed to create image directory"));
            }
            if let Err(_) = fs::create_dir_all(&old_dir) {
                return ApiResponseErr::api_err(Status::InternalServerError, String::from("Failed to create image directory"));
            }

            if old_path.exists() && old_path.is_file() && !old_path.is_symlink() {
                if let Err(_) = fs::rename(&old_path, &new_path) {
                    return ApiResponseErr::api_err(Status::InternalServerError, String::from("Failed to move card image"));
                }
            }
            //TODO: delete old image and folder
        }
        None => rjtry!(sql::card_request_accept(sql, &card_id).await),
    }

    ApiResponseErr::ok(Status::Ok, CardRequestAcceptResponse { message: String::from("Card request accepted") })
}
