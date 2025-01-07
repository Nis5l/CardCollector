use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::http::Status;
use rocket::State;

use crate::sql::Sql;
use crate::shared::friend::{self, data::{FriendStatus, FriendUsernameDb}};
use crate::shared::Id;
use crate::verify_user;
use super::data::FriendResponse;

#[get("/user/<user_id>/friends")]
pub async fn user_friends_route(sql: &State<Sql>, user_id: Id) -> ApiResponseErr<Vec<FriendResponse>> {
    verify_user!(sql, &user_id, false);

    let friends_db = rjtry!(friend::sql::user_friends_username(&sql, &user_id).await);

    let friends = friends_db.into_iter().filter_map(|friend: FriendUsernameDb| {
            let sent = friend.userone == user_id;
            let status = FriendStatus::from_database(&user_id, &friend);

            return match status {
                Some(v) => Some(FriendResponse {
                    user_id: if sent { friend.usertwo } else { friend.userone },
                    username: friend.username,
                    status: v }),
                None => { 
                    println!("Friend status invalid");
                    None
                }
            }
        }).collect();

    ApiResponseErr::ok(Status::Ok, friends)
}
