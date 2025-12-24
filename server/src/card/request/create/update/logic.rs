use rocketjson::{ ApiResponseErr, rjtry, error::ApiErrorsCreate };
use rocket::http::Status;
use rocket::State;
use std::path::Path;
use std::fs;
use std::os::unix::fs as unix_fs;

use crate::shared::crypto::JwtToken;
use crate::config::Config;
use crate::sql::Sql;
use crate::shared::Id;
use crate::shared::card;
use crate::verify_user;
use super::data::{CardUpdateResponse, CardUpdateRequest};
use super::sql;
use super::super::shared;

#[post("/card/request/update", data="<data>")]
pub async fn card_request_update_route(data: CardUpdateRequest, token: JwtToken, config: &State<Config>, sql: &State<Sql>) -> ApiResponseErr<CardUpdateResponse> {
    let user_id = &token.id;
    verify_user!(sql, user_id, true);

    if rjtry!(shared::sql::card_requests_user_count(sql, user_id).await) >= config.collector_card_request_limit as i32 {
        return ApiResponseErr::api_err(Status::Conflict, format!("Card request limit of {} reached", config.collector_card_request_limit))
    }

    //NOTE: required on top of get_card_collector_id for Created check
    //NOTE: removed, because also only image can be changed
    /* if rjtry!(shared::sql::card_exists(sql, &data.name, &data.card_type, user_id).await) {
        return ApiResponseErr::api_err(Status::Conflict, String::from("Card already exists"))
    } */

    let card_collector_id = rjtry!(card::sql::get_card_collector_id(sql, &data.card_id).await);
    let collector_id = rjtry!(card::sql::get_card_type_collector_id(sql, &data.card_type).await);

    if card_collector_id != collector_id {
        return ApiResponseErr::api_err(Status::Conflict, String::from("Card-Type collector does not match Card collector"))
    }

    //NOTE: required on top of get_card_type_collector_id for Created check
    if !rjtry!(card::sql::card_type_exists_created(sql, &collector_id, &data.card_type).await) {
        return ApiResponseErr::api_err(Status::Conflict, String::from("Card-Type does not exist"))
    }

    let card_id = Id::new(config.id_length);
    rjtry!(sql::create_card_update_request(sql, &card_id, &data.name, &data.card_type, user_id, &data.card_id).await);

    let old_path = Path::new(&config.card_fs_base)
        .join(&data.card_id.to_string())
        .join("card-image");
    let new_dir = Path::new(&config.card_fs_base).join(card_id.to_string());
    let new_path = new_dir.join("card-image");

    if let Err(_) = fs::create_dir_all(&new_dir) {
        return ApiResponseErr::api_err(Status::InternalServerError, String::from("Failed to create image directory"));
    }

    if old_path.exists() {
        let abs_old_path = match old_path.canonicalize() {
            Ok(p) => p,
            Err(_) => return ApiResponseErr::api_err(Status::InternalServerError, String::from("Failed to resolve old card image path")),
        };

        if let Err(_) = unix_fs::symlink(&abs_old_path, &new_path) {
            return ApiResponseErr::api_err(Status::InternalServerError, String::from("Failed to create symlink for card image"));
        }
    }

    ApiResponseErr::ok(Status::Ok, CardUpdateResponse { id: card_id })
}
