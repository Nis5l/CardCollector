use sqlx::Row;

use crate::{sql::Sql, shared::Id};

use super::data::UserRoleDb;

pub async fn check_refresh_token(sql: &Sql, user_id: &Id, refresh_token: &str) -> Result<bool, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let found_rows = sqlx::query(
        "SELECT COUNT(*) FROM refreshtokens WHERE uid = ? AND rtoken = ?;"
    ).bind(user_id)
    .bind(refresh_token)
    .fetch_one(&mut con).await?;

    let count: i8 = found_rows.get(0);
    Ok(count > 0)
}

pub async fn delete_refresh_token(sql: &Sql, refresh_token: &str) -> Result<u64, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let result = sqlx::query("DELETE FROM refreshtokens WHERE rtoken = ? ;")
        .bind(refresh_token)
        .execute(&mut con)
        .await?;

    Ok(result.rows_affected())
}

pub async fn insert_refresh_token(sql: &Sql, user_id: &Id, refresh_token: &str) -> Result<(), sqlx::Error> {
    let mut con = sql.get_con().await?;

    sqlx::query("INSERT INTO refreshtokens (uid, rtoken) VALUES (?,?);")
    .bind(user_id)
    .bind(refresh_token)
    .execute(&mut con)
    .await?;

    Ok(())
}

pub async fn get_user_role(sql: &Sql, username: String) -> Result<Option<UserRoleDb>, sqlx::Error> {

    let mut con = sql.get_con().await?;

    let user_role_data: Result<UserRoleDb, sqlx::Error> = sqlx::query_as(
        "SELECT uusername AS username, uranking AS role
         FROM users
         WHERE uusername=?;")
        .bind(username)
        .fetch_one(&mut con)
        .await;

    if let Err(sqlx::Error::RowNotFound) = user_role_data {
        return Ok(None);
    }

    Ok(Some(user_role_data?))
}
