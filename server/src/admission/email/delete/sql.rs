use crate::sql::Sql;
use crate::shared::Id;

pub async fn delete_verification_key(sql: &Sql, user_id: &Id) -> Result<(), sqlx::Error> {
    sqlx::query(
        "DELETE FROM verificationkeys
         WHERE uid=?;")
        .bind(user_id)
        .execute(sql.pool())
        .await?;

    Ok(())
}
