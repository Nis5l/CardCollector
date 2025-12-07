use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::http::Status;
use rocket::State;
use rand::{thread_rng, Rng};

use super::data::{UpgradeResponse, UpgradeRequest, UpgradeCardsResult};
use crate::shared::crypto::JwtToken;
use crate::sql::Sql;
use crate::shared::card::{self, data::{UnlockedCard, UnlockedCardCreateData, CardFrame}};
use crate::config::Config;
use crate::shared::Id;
use crate::verify_user;

#[post("/card/upgrade", data="<data>")]
pub async fn upgrade_route(sql: &State<Sql>, token: JwtToken, data: UpgradeRequest, config: &State<Config>) -> ApiResponseErr<UpgradeResponse> {
    let user_id = token.id;
    
    verify_user!(sql, &user_id, true);

    let card_one: UnlockedCard = match rjtry!(card::sql::get_unlocked_card(sql, &data.card_one, Some(&user_id), config).await) {
        None => return ApiResponseErr::api_err(Status::NotFound, format!("Card not found: {}", data.card_one)),
        Some(card) => card
    };

    let card_two: UnlockedCard = match rjtry!(card::sql::get_unlocked_card(sql, &data.card_two, Some(&user_id), config).await) {
        None => return ApiResponseErr::api_err(Status::NotFound, format!("Card not found: {}", data.card_two)),
        Some(card) => card
    };

    if card_one.id == card_two.id {
        return ApiResponseErr::api_err(Status::BadRequest, format!("Can not upgrade itself: {} {}", card_one.id, card_two.id));
    }

    if card_one.card.collector_id != card_two.card.collector_id {
        return ApiResponseErr::api_err(Status::BadRequest, format!("Cards are not from the same collector: {} {}", card_one.id, card_two.id));
    }

    if card_one.card.card_info.id != card_two.card.card_info.id || card_one.level != card_two.level {
        return ApiResponseErr::api_err(Status::BadRequest,
                                           format!("Character and level have to match: {}:{} {}:{}",
                                                   card_one.id,
                                                   card_one.level,
                                                   card_two.id,
                                                   card_two.level)
                                           );
    }

    let UpgradeCardsResult { create_card_data: new_card_data, success } = upgrade_cards(&card_one, &card_two, config);

    let new_card_uuid = Id::new(config.id_length);
    rjtry!(card::sql::add_card(sql, &user_id, &new_card_uuid, &card_one.card.collector_id, &new_card_data).await);

    rjtry!(card::sql::delete_card(sql, &card_one.id).await);
    rjtry!(card::sql::delete_card(sql, &card_two.id).await);

    ApiResponseErr::ok(Status::Ok, UpgradeResponse {
        success,
        card: new_card_uuid
    })
}

fn upgrade_cards(card_one: &UnlockedCard, card_two: &UnlockedCard, config: &Config) -> UpgradeCardsResult {
    let upgrade_chance = ((card_one.quality + card_two.quality) * 10) as f32;

    let mut rng = thread_rng();

    let success = rng.gen_range(0f32..=100f32) <= upgrade_chance;

    //TODO: log success

    let new_level: i32;
    let new_quality: i32;

    match success {
         true => {
            new_level = card_one.level + 1;
			new_quality = rng.gen_range(config.pack_quality_min..=config.pack_quality_max);
         },
         false => {
            new_level = card_one.level;
		    new_quality = (((card_one.quality as f32 + card_two.quality as f32) / 2f32)
                            .round() as i32 + 1)
                            .clamp(config.pack_quality_min, config.pack_quality_max);
         }
    }

    let create_card_data = UnlockedCardCreateData {
            card_id: card_one.card.card_info.id.clone(),
            //TODO: if more frames are introduced change this
            frame_id: match card_one.card_frame {
                Some(CardFrame { id, .. }) => Some(id),
                None => None
            },
            quality: new_quality,
            level: new_level
        };

    UpgradeCardsResult {
        create_card_data,
        success
    }
}
