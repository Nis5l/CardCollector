use crate::sql::Sql;
use crate::shared::Id;

pub async fn create_card_delete_request(sql: &Sql, delete_card_id: &Id, card_id: &Id, user_id: &Id) -> Result<(), sqlx::Error> {
    sqlx::query("INSERT INTO deletecards
                 (dcid, cid, uid)
                 VALUES
                 (?, ?, ?)")
        .bind(delete_card_id)
        .bind(card_id)
        .bind(user_id)
        .execute(sql.pool())
        .await?;

    Ok(())
}
