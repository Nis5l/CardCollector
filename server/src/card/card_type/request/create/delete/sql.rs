use crate::sql::Sql;
use crate::shared::Id;

pub async fn card_type_delete_request_create(sql: &Sql, delete_card_type_id: &Id, card_type_id: &Id, user_id: &Id) -> Result<(), sqlx::Error> {
    sqlx::query("INSERT INTO deletecardtypes
                 (dctid, ctid, uid)
                 VALUES
                 (?, ?, ?)")
        .bind(delete_card_type_id)
        .bind(card_type_id)
        .bind(user_id)
        .execute(sql.pool())
        .await?;

    Ok(())
}
