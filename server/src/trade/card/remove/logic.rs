use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::http::Status;
use rocket::State;

use super::data::TradeCardRemoveResponse;
use super::sql;
use crate::shared::Id;
use crate::shared::{card, friend, trade};
use crate::sql::Sql;
use crate::shared::crypto::JwtToken;
use crate::config::Config;
use crate::{verify_user, verify_collector};

#[post("/trade/<user_friend_id>/<collector_id>/card/remove/<card_unlocked_id>")]
pub async fn trade_card_remove_route(user_friend_id: Id, card_unlocked_id: Id, collector_id: Id, sql: &State<Sql>, config: &State<Config>, token: JwtToken) -> ApiResponseErr<TradeCardRemoveResponse> {
    let user_id = token.id;

    verify_user!(sql, &user_id, true);
    //NOTE: could be removed if not for the username
    let user_friend_username = verify_user!(sql, &user_friend_id, false);
    verify_collector!(sql, &collector_id);

    if !rjtry!(friend::sql::user_has_friend(sql, &user_id, &user_friend_id).await) {
        return ApiResponseErr::api_err(Status::NotFound, format!("No friend with id {} found", &user_friend_id));
    }

    let trade_id = rjtry!(trade::sql::create_trade(sql, &Id::new(config.id_length), &user_id, &user_friend_id, &collector_id).await);

    if !rjtry!(card::sql::user_owns_card(sql, &user_id, &card_unlocked_id, Some(&collector_id)).await) {
        return ApiResponseErr::api_err(Status::NotFound,
                                       format!("The card with the id {} does not exist or is not owned by {} in the collector {}",
                                               &card_unlocked_id,
                                               &user_id,
                                               &collector_id
                                        ));
    }

    if !rjtry!(sql::delete_trade_card(sql, &trade_id, &card_unlocked_id).await) {
        return ApiResponseErr::api_err(Status::NotFound,
                                   format!("The card with the id {} is not in the trade with the user {}",
                                           &card_unlocked_id, &user_friend_username));
    }

    rjtry!(trade::sql::set_trade_status(sql, &trade_id, trade::data::TradeStatus::UnConfirmed).await);

    ApiResponseErr::ok(Status::Ok, TradeCardRemoveResponse {
        message: format!("Removed card with id {} from Trade with {}", &card_unlocked_id, user_friend_username)
    })
}
