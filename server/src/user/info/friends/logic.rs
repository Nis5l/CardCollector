use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::http::Status;
use rocket::State;

use crate::sql::Sql;
use crate::shared::user::data::{User, UserDb};
use crate::shared::friend::{self, data::{FriendStatus, FriendUserDb}};
use crate::shared::Id;
use crate::verify_user;
use super::data::FriendResponse;

#[get("/user/<user_id>/friends")]
pub async fn user_friends_route(sql: &State<Sql>, user_id: Id) -> ApiResponseErr<Vec<FriendResponse>> {
    verify_user!(sql, &user_id, false);

    let friends_db = rjtry!(friend::sql::user_friends_username(&sql, &user_id).await);

    let friends = friends_db.into_iter().filter_map(|friend: FriendUserDb| {
            let sent = friend.uidone == user_id;
            let status = FriendStatus::from_database(&user_id, &friend);

            return match status {
                Some(v) => Some(FriendResponse {
                    user: User::from(UserDb {
                        uid: if sent { friend.uidtwo } else { friend.uidone },
                        uusername: friend.uusername,
                        uranking: friend.uranking,
                        utime: friend.utime
                    }),
                    status: v }),
                None => { 
                    println!("Friend status invalid");
                    None
                }
            }
        }).collect();

    ApiResponseErr::ok(Status::Ok, friends)
}
