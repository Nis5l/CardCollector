use crate::sql::Sql;
use crate::shared::Id;

pub async fn update_password(sql: &Sql, user_id: &Id, password: &str) -> Result<(), sqlx::Error> {
    let mut transaction = sql.pool().begin().await?;

    sqlx::query(
        "UPDATE users
         SET upassword=?
         WHERE uid=?;")
        .bind(password)
        .bind(user_id)
        .execute(&mut *transaction)
        .await?;

    sqlx::query(
        "DELETE FROM passwordresetkeys
         WHERE uid=?;")
        .bind(user_id)
        .execute(&mut *transaction)
        .await?;

    transaction.commit().await?;

    Ok(())
}
