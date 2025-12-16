use super::data::{FriendDb, FriendUsernameDb};
use crate::sql::Sql;
use crate::shared::Id;

pub async fn used_friend_slots(sql: &Sql, user_id: &Id) -> Result<i64, sqlx::Error> {
    let (count, ): (i64, ) = sqlx::query_as(
        "SELECT COUNT(*)
         FROM friends
         WHERE uidtwo=? AND frstatus=1 OR uidone=?;")
        .bind(user_id)
        .bind(user_id)
        .fetch_one(sql.pool())
        .await?;

    Ok(count)
}


pub async fn user_friends_username(sql: &Sql, user_id: &Id) -> Result<Vec<FriendUsernameDb>, sqlx::Error> {
    let friends: Vec<FriendUsernameDb> = sqlx::query_as(
            "SELECT
             users.uusername AS username,
             friends.uidone AS userone,
             friends.uidtwo AS usertwo,
             friends.frstatus AS friendStatus
             FROM
             friends,
             users
             WHERE friends.uidone=? AND users.uid=friends.uidtwo
             UNION
             SELECT
             users.uusername AS username,
             friends.uidone AS userone,
             friends.uidtwo AS usertwo,
             friends.frstatus AS friendStatus
             FROM
             friends,
             users
             WHERE friends.uidtwo=? AND users.uid=friends.uidone;")
        .bind(user_id)
        .bind(user_id)
        .fetch_all(sql.pool())
        .await?;

    Ok(friends)
}

//TODO: return Friend not frienddb
pub async fn user_friend(sql: &Sql, user_id: &Id, user_friend_id: &Id) -> Result<Option<FriendDb>, sqlx::Error> {
    let friends: Result<FriendDb, sqlx::Error> = sqlx::query_as(
            "SELECT
             friends.uidone AS userone,
             friends.uidtwo AS usertwo,
             friends.frstatus AS friendStatus
             FROM
             friends
             WHERE
             (friends.uidone=? AND friends.uidtwo=?) OR
             (friends.uidtwo=? AND friends.uidone=?);")
        .bind(user_id)
        .bind(user_friend_id)
        .bind(user_id)
        .bind(user_friend_id)
        .fetch_one(sql.pool())
        .await;

    if let Err(sqlx::Error::RowNotFound) = friends {
        return Ok(None);
    }

    Ok(Some(friends?))
}

pub async fn user_has_friend(sql: &Sql, user_id: &Id, user_friend_id: &Id) -> Result<bool, sqlx::Error> {
    let (count, ): (i64, ) = sqlx::query_as(
            "SELECT
             COUNT(*)
             FROM
             friends
             WHERE
             (friends.uidone=? AND friends.uidtwo=?) OR
             (friends.uidtwo=? AND friends.uidone=?);")
        .bind(user_id)
        .bind(user_friend_id)
        .bind(user_id)
        .bind(user_friend_id)
        .fetch_one(sql.pool())
        .await?;

    Ok(count != 0)
}
