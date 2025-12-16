use crate::{sql::Sql, shared::Id};
use super::data::LoginDb;

pub async fn get_user_password(sql: &Sql, username: &str) -> Result<Option<LoginDb>, sqlx::Error> {
    let login_data: Result<LoginDb, sqlx::Error> = sqlx::query_as(
        "SELECT uid AS id, uusername AS username, upassword AS password, uranking AS role
         FROM users
         WHERE uusername=?
         OR uemail=?;")
        .bind(&username)
        .bind(&username)
        .fetch_one(sql.pool())
        .await;

    if let Err(sqlx::Error::RowNotFound) = login_data {
        return Ok(None);
    }

    Ok(Some(login_data?))
}

pub async fn insert_refresh_token(sql: &Sql, user_id: &Id, refresh_token: &str) -> Result<(), sqlx::Error> {
    sqlx::query("INSERT INTO refreshtokens (uid, rtoken) VALUES (?,?);")
    .bind(user_id)
    .bind(refresh_token)
    .execute(sql.pool())
    .await?;

    Ok(())
}
