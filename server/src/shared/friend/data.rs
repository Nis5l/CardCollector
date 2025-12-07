use serde_repr::Serialize_repr;
use serde::Serialize;
use sqlx::FromRow;

use crate::shared::Id;

#[derive(Debug, Serialize_repr)]
#[repr(i32)]
pub enum FriendStatus {
    Nothing = 0,
    Friend = 1,
    Pending = 2,
    Sent = 3
}

impl FriendStatus {
    pub fn from_database(user_id: &Id, friend: &dyn FriendStatusParam) -> Option<Self> {
        match friend.get_status() {
            0 => return if friend.is_sent(user_id) { Some(FriendStatus::Sent) } else { Some(FriendStatus::Pending) },
            1 => return Some(FriendStatus::Friend),
            _ => None
        }
    }
}

pub trait FriendStatusParam {
    fn is_sent(&self, user_id: &Id) -> bool;
    fn get_status(&self) -> i32;
}

#[derive(Debug, Serialize, FromRow)]
pub struct FriendUsernameDb {
    pub username: String,
    pub userone: Id,
    pub usertwo: Id,
    #[sqlx(rename="friendStatus")]
    pub friend_status: i32
}

impl FriendStatusParam for FriendUsernameDb {
    fn is_sent(&self, user_id: &Id) -> bool {
        &self.userone == user_id
   }

    fn get_status(&self) -> i32 {
        self.friend_status
   }
}

#[derive(Debug, Serialize, FromRow)]
pub struct FriendDb {
    pub userone: Id,
    pub usertwo: Id,
    #[sqlx(rename="friendStatus")]
    pub friend_status: i32
}

impl FriendStatusParam for FriendDb {
    fn is_sent(&self, user_id: &Id) -> bool {
        &self.userone == user_id
   }

    fn get_status(&self) -> i32 {
        self.friend_status
   }
}
