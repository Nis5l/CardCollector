use crate::sql::Sql;
use crate::shared::Id;
use crate::shared::card::data::CardState;

pub async fn card_type_request_decline(sql: &Sql, card_type_id: &Id) -> Result<(), sqlx::Error> {
    sqlx::query("DELETE FROM cardtypes
                 WHERE ctid=?
                 AND ctstate=?;")
        .bind(card_type_id)
        .bind(CardState::Requested as i32)
        .execute(sql.pool())
        .await?;

    Ok(())
}

pub async fn delete_card_type_request_decline(sql: &Sql, card_type_id: &Id) -> Result<(), sqlx::Error> {
    sqlx::query("DELETE FROM deletecardtypes
                 WHERE dctid=?;")
        .bind(card_type_id)
        .execute(sql.pool())
        .await?;

    Ok(())
}
