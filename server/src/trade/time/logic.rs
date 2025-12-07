use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::State;
use rocket::http::Status;

use super::data::TradeTimeResponse;
use super::sql;
use crate::sql::Sql;
use crate::config::Config;
use crate::shared::Id;
use crate::shared::crypto::JwtToken;
use crate::shared::{trade, util, friend};
use crate::{verify_user, verify_collector};

#[get("/trade/<user_friend_id>/<collector_id>/time")]
pub async fn trade_time_route(user_friend_id: Id, collector_id: Id, token: JwtToken, sql: &State<Sql>, config: &State<Config>) -> ApiResponseErr<TradeTimeResponse> {
    let user_id = token.id;
    
    verify_user!(sql, &user_id, true);
    //NOTE: could be removed if not for the username
    let user_friend_username = verify_user!(sql, &user_friend_id, false);
    verify_collector!(sql, &collector_id);

    if !rjtry!(friend::sql::user_has_friend(sql, &user_id, &user_friend_id).await) {
        return ApiResponseErr::api_err(Status::NotFound, format!("You are not a friend with {}", user_friend_username));
    }
    let trade_id = rjtry!(trade::sql::create_trade(sql, &Id::new(config.id_length), &user_id, &user_friend_id, &collector_id).await);

    let last_trade_time = rjtry!(sql::last_trade_time(sql, &trade_id).await);

    let trade_time = util::time_from_db(last_trade_time, config.trade_cooldown);

    ApiResponseErr::ok(Status::Ok, TradeTimeResponse {
        trade_time
    })
}
