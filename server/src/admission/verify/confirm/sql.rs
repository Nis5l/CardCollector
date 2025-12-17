use crate::sql::Sql;
use crate::shared::Id;
use crate::shared::user::data::UserVerified;

pub async fn user_verified(sql: &Sql, user_id: &Id) -> Result<i32, sqlx::Error> {
    let (verified, ): (i32, ) = sqlx::query_as(
        "SELECT uverified
         FROM users
         WHERE uid=?;")
        .bind(user_id)
        .fetch_one(sql.pool())
        .await?;

    Ok(verified)
}

pub async fn verify_user(sql: &Sql, user_id: &Id) -> Result<(), sqlx::Error> {
    sqlx::query(
        "UPDATE users
         SET uverified=?
         WHERE uid=?;")
        .bind(UserVerified::Yes as i32)
        .bind(user_id)
        .execute(sql.pool())
        .await?;

    Ok(())
}

pub async fn get_user_id_by_verification_key(sql: &Sql, key: &str) -> Result<Option<Id>, sqlx::Error> {
    let stmt: Result<(Id, ), sqlx::Error> = sqlx::query_as(
        "SELECT uid
         FROM verificationkeys
         WHERE vkkey=?;")
        .bind(key)
        .fetch_one(sql.pool())
        .await;

    if let Err(sqlx::Error::RowNotFound) = stmt {
        return Ok(None);
    }

    Ok(Some(stmt?.0))
}
