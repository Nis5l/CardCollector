use crate::sql::Sql;
use crate::shared::Id;

pub async fn password_reset_key_user_id(sql: &Sql, key: &str) -> Result<Option<Id>, sqlx::Error> {
    let stmt = sqlx::query_as(
        "SELECT uid
         FROM passwordresetkeys
         WHERE prkey=?;")
        .bind(key)
        .fetch_one(sql.pool())
        .await;

    if let Err(sqlx::Error::RowNotFound) = stmt {
        return Ok(None);
    }

    let (user_id, ): (Id, ) = stmt?;

    Ok(Some(user_id))
}
