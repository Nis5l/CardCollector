use crate::sql::Sql;
use crate::shared::{Id, DbParseError};
use super::data::{UserVerified, UserRanking, EmailVerifiedDb};

pub async fn user_id_from_username(sql: &Sql, username: &str) -> Result<Option<Id>, sqlx::Error> {
    let stmt: Result<(Id, ), sqlx::Error> = sqlx::query_as(
        "SELECT uid
         FROM users
         WHERE uusername=?;")
        .bind(username)
        .fetch_one(sql.pool())
        .await;

    if let Err(sqlx::Error::RowNotFound) = stmt {
        return Ok(None);
    }

    Ok(Some(stmt?.0))
}

pub async fn username_from_user_id(sql: &Sql, user_id: &Id) -> Result<Option<String>, sqlx::Error> {
    let stmt: Result<(String, ), sqlx::Error> = sqlx::query_as(
        "SELECT uusername
         FROM users
         WHERE uid=?;")
        .bind(user_id)
        .fetch_one(sql.pool())
        .await;

    if let Err(sqlx::Error::RowNotFound) = stmt {
        return Ok(None)
    }

    Ok(Some(stmt?.0))
}

pub async fn set_email(sql: &Sql, user_id: &Id, email: Option<&str>) -> Result<() , sqlx::Error> {
    sqlx::query(
        "UPDATE users
         SET uemail=?
         WHERE uid=?;")
        .bind(email)
        .bind(user_id)
        .execute(sql.pool())
        .await?;

    Ok(())
}

pub async fn user_verified(sql: &Sql, user_id: &Id) -> Result<UserVerified, sqlx::Error> {
    let (verified, ): (i32, ) = sqlx::query_as(
        "SELECT uverified
         FROM users
         WHERE uid=?;")
        .bind(user_id)
        .fetch_one(sql.pool())
        .await?;

    Ok(UserVerified::from(verified))
}

pub async fn email_exists(sql: &Sql, email: &str) -> Result<bool, sqlx::Error> {
    let (count,): (i64,) = sqlx::query_as(
        "SELECT COUNT(*)
         FROM users
         WHERE uemail=?;")
        .bind(email)
        .fetch_one(sql.pool())
        .await?;

    Ok(count != 0)
}

pub async fn set_verification_key(sql: &Sql, user_id: &Id, key: &str) -> Result<(), sqlx::Error> {
    let mut transaction = sql.pool().begin().await?;

    sqlx::query(
        "DELETE FROM verificationkeys
         WHERE uid=?;")
        .bind(user_id)
        .execute(&mut *transaction)
        .await?;

    sqlx::query(
        "INSERT INTO verificationkeys
         (uid, vkkey, vkcreated)
         VALUES
         (?, ?, NOW());")
        .bind(user_id)
        .bind(key)
        .execute(&mut *transaction)
        .await?;

    transaction.commit().await?;

    Ok(())
}

pub async fn get_user_rank(sql: &Sql, user_id: &Id) -> Result<UserRanking, sqlx::Error> {
    let (ranking, ): (i32, ) = sqlx::query_as(
        "SELECT uranking
         FROM users
         WHERE uid=?;")
        .bind(user_id)
        .fetch_one(sql.pool())
        .await?;

    Ok(UserRanking::from(ranking))
}

pub async fn get_verify_data(sql: &Sql, user_id: &Id) -> Result<Option<EmailVerifiedDb>, sqlx::Error> {
    let stmt: Result<EmailVerifiedDb, sqlx::Error> = sqlx::query_as(
        "SELECT uusername, uemail, uverified
         FROM users
         WHERE uid=?;")
        .bind(user_id)
        .fetch_one(sql.pool())
        .await;

    if let Err(sqlx::Error::RowNotFound) = stmt {
        return Ok(None)
    }

    Ok(Some(stmt?))
}

pub async fn set_profile_image(sql: &Sql, user_id: &Id, image_hash: &str) -> Result<(), sqlx::Error> {
    sqlx::query(
        "UPDATE users
         SET uprofileimage=?
         WHERE uid=?;")
        .bind(image_hash)
        .bind(user_id)
        .execute(sql.pool())
        .await?;

    Ok(())
}

pub async fn get_profile_image(sql: &Sql, user_id: &Id) -> Result<Option<String>, sqlx::Error> {
    let stmt: Result<(Option<String>,), sqlx::Error> = sqlx::query_as(
        "SELECT uprofileimage
         FROM users
         WHERE uid=?;")
        .bind(user_id)
        .fetch_one(sql.pool())
        .await;

    if let Err(sqlx::Error::RowNotFound) = stmt {
        return Ok(None)
    }

    Ok(stmt?.0)
}
