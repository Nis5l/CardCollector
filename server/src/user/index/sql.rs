use crate::sql::Sql;
use crate::shared::util;
use crate::shared::user::data::{UserVerified, UserDb, User};

pub async fn get_users(sql: &Sql, mut username: String, amount: u32, offset: u32) -> Result<Vec<User>, sqlx::Error> {
    username = util::escape_for_like(username);

    let users_db: Vec<UserDb> = sqlx::query_as(
        "SELECT uid, uusername, uranking, utime
         FROM users
         WHERE uusername LIKE CONCAT('%', ?, '%')
         AND uverified = ?
         LIMIT ? OFFSET ?;")
        .bind(username)
        .bind(UserVerified::Yes as i32)
        .bind(amount)
        .bind(offset)
        .fetch_all(sql.pool())
        .await?;

    let users: Vec<User> = users_db.into_iter().map(User::from).collect();

    Ok(users)
}

pub async fn get_users_count(sql: &Sql, mut username: String) -> Result<u32, sqlx::Error> {
    username = util::escape_for_like(username);

    let (count, ): (i64, ) = sqlx::query_as(
        "SELECT COUNT(*)
         FROM users
         WHERE uusername LIKE CONCAT('%', ?, '%')
         AND uverified = ?;")
        .bind(username)
        .bind(UserVerified::Yes as i32)
        .fetch_one(sql.pool())
        .await?;

    Ok(count as u32)
}
