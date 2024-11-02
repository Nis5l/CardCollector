use serde::Serialize;
use sqlx::FromRow;
use crate::shared::Id;

//TODO: creation date
#[derive(Debug, Serialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct Collector {
    pub id: Id,
    pub name: String,
    #[sqlx(rename="userId")]
    pub user_id: Id
}

#[macro_export]
macro_rules! verify_collector {
    ( $sql:expr, $collector_id:expr ) => {
        let collector_exists = rocketjson::rjtry!(crate::shared::collector::sql::collector_exists($sql, $collector_id).await);
        if !collector_exists {
            return rocketjson::ApiResponseErr::api_err(rocket::http::Status::NotFound, String::from("Collector not found"));
        }
    };
}

#[macro_export]
macro_rules! verify_collector_admin {
    ( $sql:expr, $collector_id:expr, $user_id:expr ) => {
        match crate::shared::collector::sql::collecor_is_admin($sql, $collector_id, $user_id).await {
            Ok(true) => (),
            Ok(false) => return ApiResponseErr::api_err(Status::Unauthorized, String::from("Admin priviliges for collector Required")),
            Err(_) => return ApiResponseErr::api_err(Status::InternalServerError, String::from("Database Error"))
        }
    };
}

pub enum CollectorSetting {
    PackCooldown,
    PackAmount,
    PackQualityMin,
    PackQualityMax,
    TradeCooldown,
    TradeCardLimit
}

impl std::string::ToString for CollectorSetting {
    fn to_string(&self) -> String {
        String::from(match self {
            CollectorSetting::PackCooldown => "pack_cooldown",
            CollectorSetting::PackAmount => "pack_amount",
            CollectorSetting::PackQualityMin => "pack_quality_min",
            CollectorSetting::PackQualityMax => "pack_quality_max",
            CollectorSetting::TradeCooldown => "trade_cooldown",
            CollectorSetting::TradeCardLimit => "trade_card_limit"
        })
    }
}
