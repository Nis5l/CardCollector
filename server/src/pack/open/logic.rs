use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::http::Status;
use rocket::State;
use chrono::{DateTime, Utc, Duration};
use rand::Rng;
use std::ops::RangeInclusive;

use super::data::{PackOpenResponse, CanOpenPack};
use super::sql;
use super::super::shared;
use crate::shared::crypto::JwtToken;
use crate::sql::Sql;
use crate::config::Config;
use crate::shared::card::{self, data::UnlockedCardCreateData};
use crate::shared::Id;
use crate::{verify_user, verify_collector};
use crate::shared::card::packstats::sql::add_pack_stats;
use crate::shared::collector::{get_collector_setting, CollectorSetting};

#[post("/pack/<collector_id>/open")]
pub async fn pack_open_route(collector_id: Id, sql: &State<Sql>, token: JwtToken, config: &State<Config>) -> ApiResponseErr<PackOpenResponse> {
    let user_id = token.id;

    verify_user!(sql, &user_id, true);
    verify_collector!(sql, &collector_id);

    let pack_amount = rjtry!(get_collector_setting(sql, &collector_id, CollectorSetting::PackAmount, config.pack_amount).await);
    let pack_quality_min = rjtry!(get_collector_setting(sql, &collector_id, CollectorSetting::PackQualityMin, config.pack_quality_min).await);
    let pack_quality_max = rjtry!(get_collector_setting(sql, &collector_id, CollectorSetting::PackQualityMax, config.pack_quality_max).await);

    let last_opened = rjtry!(shared::sql::get_pack_time(sql, &user_id, &collector_id).await);

    if let CanOpenPack::No(next_time) = can_open_pack(last_opened, rjtry!(get_collector_setting(sql, &collector_id, CollectorSetting::PackCooldown, config.pack_cooldown).await)) {
        return ApiResponseErr::api_err(Status::Conflict, format!("Wait until: {}", next_time));
    }

    let cards_create_data = rjtry!(get_random_cards(sql, pack_amount, pack_quality_min..=pack_quality_max, &collector_id).await);

    let mut inserted_cards_uuids = Vec::new();
    for card_create_data in cards_create_data.iter() {
        let inserted_card_uuid = Id::new(config.id_length);
        rjtry!(card::sql::add_card(&sql, &user_id, &inserted_card_uuid, &collector_id, card_create_data).await);
        inserted_cards_uuids.push(inserted_card_uuid);
    }

    rjtry!(sql::set_pack_time(&sql, &user_id, &collector_id, Utc::now()).await);

    let cards = rjtry!(card::sql::get_unlocked_cards(&sql, inserted_cards_uuids, None).await);

    rjtry!(add_pack_stats(sql, &user_id, &collector_id, pack_amount as i32, &Utc::now()).await);

    ApiResponseErr::ok(Status::Ok, PackOpenResponse {
        cards
    })
}

fn can_open_pack(last_opened: Option<DateTime<Utc>>, pack_cooldown: u32) -> CanOpenPack {
    match last_opened {
        None => {
            return CanOpenPack::Yes;
        },
        Some(time) => {
            let next_time = time + Duration::seconds(pack_cooldown as i64);
            if Utc::now() >= next_time {
                return CanOpenPack::Yes;
            }
            return CanOpenPack::No(next_time);
        }
    }
}

async fn get_random_cards(sql: &Sql, amount: u32, quality_range: RangeInclusive<i32>, collector_id: &Id) -> Result<Vec<UnlockedCardCreateData>, sqlx::Error> {
    let new_cards_create = sql::get_random_card_data(sql, amount, collector_id).await?;

	//NOTE: maybe this could be smth for the future:
    // (highest-level)^3 * 0.5

    let mut rng = rand::rng();

    let mut cards_create_data = Vec::new();

    for card in new_cards_create.iter() {
        let quality: i32 = rng.random_range(quality_range.clone());

        //TODO: improve the way to pick level (not algorythm but code)
        let mut level = 0;
        let level_random: i32 = rng.random_range(0..=1000);
        if level_random <= 50 {
            level = 1;
            if level_random <= 5 {
                level = 2;
            }
        }

        let card_create_data = UnlockedCardCreateData {
            card_id: card.card_id.clone(),
            level,
            frame_id: None,
            quality
        };

        cards_create_data.push(card_create_data);
    }

    Ok(cards_create_data)
}
