use crate::sql::Sql;
use crate::shared::util;
use crate::shared::Id;
use crate::shared::user::data::{UserVerified, UserDb, User};

pub async fn get_users(sql: &Sql, mut username: String, exclude_ids: &Vec<Id>, amount: u32, offset: u32) -> Result<Vec<User>, sqlx::Error> {
    username = util::escape_for_like(username);

     let mut query = String::from("SELECT uid, uusername, uranking, utime
                      FROM users
                      WHERE uusername LIKE CONCAT('%', ?, '%')
                      AND uverified = ?");

    if !exclude_ids.is_empty() {
        let placeholders = exclude_ids
            .iter()
            .map(|_| "?")
            .collect::<Vec<_>>()
            .join(",");

        query.push_str(&format!(" AND uid NOT IN ({})", placeholders));
    }

    query.push_str(" LIMIT ? OFFSET ?");

    let mut q = sqlx::query_as::<_, UserDb>(&query)
        .bind(username)
        .bind(UserVerified::Yes as i32);

    for id in exclude_ids {
        q = q.bind(id);
    }

    let users_db: Vec<UserDb> = q
        .bind(amount)
        .bind(offset)
        .fetch_all(sql.pool())
        .await?;

    let users: Vec<User> = users_db.into_iter().map(User::from).collect();

    Ok(users)
}

pub async fn get_users_count(sql: &Sql, mut username: String, exclude_ids: &Vec<Id>) -> Result<u32, sqlx::Error> {
    username = util::escape_for_like(username);

    let mut query = String::from("SELECT COUNT(*)
                     FROM users
                     WHERE uusername LIKE CONCAT('%', ?, '%')
                     AND uverified = ?");

    if !exclude_ids.is_empty() {
        let placeholders = exclude_ids
            .iter()
            .map(|_| "?")
            .collect::<Vec<_>>()
            .join(",");

        query.push_str(&format!(" AND uid NOT IN ({})", placeholders));
    }

    let mut q = sqlx::query_as::<_, (i32, )>(&query)
        .bind(username)
        .bind(UserVerified::Yes as i32);

    for id in exclude_ids {
        q = q.bind(id);
    }

    let (count, ): (i32, ) = q
        .fetch_one(sql.pool())
        .await?;

    Ok(count as u32)
}
