use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::{State, http::Status};

use crate::sql::Sql;
use crate::config::Config;
use crate::shared::friend;
use crate::shared::Id;
use crate::verify_user;
use super::sql;
use super::data::UserStatsGlobalResponse;
use super::super::shared::sql::get_achievements;

#[get("/user/<user_id>/stats")]
pub async fn user_stats_global_route(user_id: Id, sql: &State<Sql>, config: &State<Config>) -> ApiResponseErr<UserStatsGlobalResponse> {
    let username = verify_user!(sql, &user_id, false);

    let friend_count = rjtry!(friend::sql::used_friend_slots(sql, &user_id).await);

    let collector_favorites = match sql::get_favorite_collectors(sql, &user_id).await {
        Ok(fav) => fav,
        _ => vec!()
    };

    let achievements = rjtry!(get_achievements(sql, &user_id, None).await);

    ApiResponseErr::ok(Status::Ok, UserStatsGlobalResponse {
        username,
        max_friends: config.max_friends,
        friends: friend_count,

        collector_favorites,

        achievements
    })
}
