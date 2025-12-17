use crate::{sql::Sql, shared::Id};
use chrono::{DateTime, Utc};

pub async fn get_password_reset_key_created(sql: &Sql, user_id: &Id) -> Result<Option<DateTime<Utc>>, sqlx::Error> {
    let stmt = sqlx::query_as(
        "SELECT prcreated
         FROM passwordresetkeys
         WHERE uid=?;")
        .bind(user_id)
        .fetch_one(sql.pool())
        .await;

    if let Err(sqlx::Error::RowNotFound) = stmt {
        return Ok(None);
    }

    let (time, ): (Option<DateTime<Utc>>, ) = stmt?;
    Ok(time)
}

pub async fn user_from_username_or_email(sql: &Sql, username_or_email: &str) -> Result<Option<(Id, String, String)>, sqlx::Error> {
    let stmt: Result<(Id, String, String, ), sqlx::Error> = sqlx::query_as(
        "SELECT uid, uusername, uemail
         FROM users
         WHERE uusername=?
         OR uemail=?;")
        .bind(username_or_email)
        .bind(username_or_email)
        .fetch_one(sql.pool())
        .await;

    if let Err(sqlx::Error::RowNotFound) = stmt {
        return Ok(None);
    }

    Ok(Some(stmt?))
}

pub async fn set_password_reset_key(sql: &Sql, user_id: &Id, key: &str) -> Result<(), sqlx::Error> {
    let mut transaction = sql.pool().begin().await?;

    sqlx::query(
        "DELETE FROM passwordresetkeys
         WHERE uid=?;")
        .bind(user_id)
        .execute(&mut *transaction)
        .await?;

    sqlx::query(
        "INSERT INTO passwordresetkeys
         (uid, prkey, prcreated)
         VALUES
         (?, ?, NOW());")
        .bind(user_id)
        .bind(key)
        .execute(&mut *transaction)
        .await?;

    transaction.commit().await?;

    Ok(())
}
