use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::http::Status;
use rocket::State;

use super::data::TradeResponse;
use super::sql;
use crate::sql::Sql;
use crate::config::Config;
use crate::shared::Id;
use crate::shared::crypto::JwtToken;
use crate::shared::{util, friend, trade};
use crate::{verify_user, verify_collector};

#[get("/trade/<user_friend_id>/<collector_id>")]
pub async fn trade_route(user_friend_id: Id, collector_id: Id, sql: &State<Sql>, config: &State<Config>, token: JwtToken) -> ApiResponseErr<TradeResponse> {
    let user_id = token.id;

    verify_user!(sql, &user_id, true);
    //NOTE: could be removed if not for the username
    let friend_username = verify_user!(sql, &user_friend_id, false);
    verify_collector!(sql, &collector_id);

    if !rjtry!(friend::sql::user_has_friend(sql, &user_id, &user_friend_id).await) {
        return ApiResponseErr::api_err(Status::NotFound, format!("You are not friends with {}", friend_username));
    }
    let trade_id = rjtry!(trade::sql::create_trade(sql, &Id::new(config.id_length), &user_id, &user_friend_id, &collector_id).await);

    let self_cards = rjtry!(sql::trade_cards(sql, &user_id, &trade_id, config).await);
    let friend_cards = rjtry!(sql::trade_cards(sql, &user_friend_id, &trade_id, config).await);

    let self_card_suggestions = rjtry!(sql::trade_suggestions(sql, &user_id, &trade_id, config).await);
    let friend_card_suggestions = rjtry!(sql::trade_suggestions(sql, &user_friend_id, &trade_id, config).await);

    let trade_db = rjtry!(trade::sql::get_trade(sql, &user_id, &trade_id).await);

    let (self_status, friend_status) =
        if let (Ok(self_status), Ok(friend_status)) = (trade::data::TradeStatus::from_int(trade_db.self_status), trade::data::TradeStatus::from_int(trade_db.friend_status)) {
            (self_status, friend_status)
    } else {
        return ApiResponseErr::api_err(Status::InternalServerError, String::from("Internal Server Error"));
    };

    let trade_time = util::time_from_db(trade_db.last_trade, config.trade_cooldown);

    ApiResponseErr::ok(Status::Ok, TradeResponse {
        self_cards,
        friend_cards,
        self_card_suggestions,
        friend_card_suggestions,
        friend_username,
        self_status,
        friend_status,
        trade_time,
        trade_card_limit: config.trade_card_limit
    })
}
