use crate::sql::Sql;
use crate::shared::Id;

pub async fn get_email(sql: &Sql, user_id: Id) -> Result<String, sqlx::Error> {
    let (email, ): (String, ) = sqlx::query_as(
        "SELECT uemail
         FROM users
         WHERE uid=?;")
        .bind(user_id)
        .fetch_one(sql.pool())
        .await?;

    Ok(email)
}
