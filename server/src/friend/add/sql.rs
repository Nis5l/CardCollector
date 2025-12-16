use crate::sql::Sql;
use crate::shared::Id;

pub async fn send_friend_request(sql: &Sql, user_id: &Id, user_id_receiver: &Id) -> Result<(), sqlx::Error> {
    sqlx::query(
        "INSERT INTO friends
         (uidone, uidtwo, frstatus)
         VALUES
         (?, ?, 0)")
        .bind(user_id)
        .bind(user_id_receiver)
        .execute(sql.pool())
        .await?;

    Ok(())
}
