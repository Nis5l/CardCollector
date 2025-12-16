use crate::{sql::Sql, shared::Id};
use chrono::{DateTime, Utc};

pub async fn get_verification_key_created(sql: &Sql, user_id: &Id) -> Result<Option<DateTime<Utc>>, sqlx::Error> {
    let stmt = sqlx::query_as(
        "SELECT vkcreated
         FROM verificationkeys
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
