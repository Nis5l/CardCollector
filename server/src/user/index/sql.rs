use crate::sql::Sql;
use crate::shared::Id;
use crate::shared::util;
use crate::shared::user::data::UserVerifiedDb;

pub async fn get_users(sql: &Sql, mut username: String, amount: u32, offset: u32) -> Result<Vec<(String, Id)>, sqlx::Error> {
    let mut con = sql.get_con().await?;

    username = util::escape_for_like(username);

    let users: Vec<(String, Id)> = sqlx::query_as(
        "SELECT uusername, uid
         FROM users
         WHERE uusername LIKE CONCAT('%', ?, '%')
         AND uverified = ?
         LIMIT ? OFFSET ?;")
        .bind(username)
        .bind(UserVerifiedDb::Yes as i32)
        .bind(amount)
        .bind(offset)
        .fetch_all(&mut con)
        .await?;

    Ok(users)
}

pub async fn get_users_count(sql: &Sql, mut username: String) -> Result<u32, sqlx::Error> {
    let mut con = sql.get_con().await?;

    username = util::escape_for_like(username);

    let (count, ): (i64, ) = sqlx::query_as(
        "SELECT COUNT(*)
         FROM users
         WHERE uusername LIKE CONCAT('%', ?, '%')
         AND uverified = ?;")
        .bind(username)
        .bind(UserVerifiedDb::Yes as i32)
        .fetch_one(&mut con)
        .await?;

    Ok(count as u32)
}
