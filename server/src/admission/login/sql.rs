use crate::{sql::Sql, shared::Id};
use super::data::LoginDb;

pub async fn get_user_password(sql: &Sql, username: String) -> Result<Option<LoginDb>, sqlx::Error> {

    let mut con = sql.get_con().await?;

    let login_data: Result<LoginDb, sqlx::Error> = sqlx::query_as(
        "SELECT uid AS id, uusername AS username, upassword AS password, uranking AS role
         FROM users
         WHERE uusername=?;")
        .bind(username)
        .fetch_one(&mut con)
        .await;

    if let Err(sqlx::Error::RowNotFound) = login_data {
        return Ok(None);
    }

    Ok(Some(login_data?))
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
