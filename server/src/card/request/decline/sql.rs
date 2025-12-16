use crate::sql::Sql;
use crate::shared::Id;
use crate::shared::card::data::CardState;

pub async fn card_request_decline(sql: &Sql, card_id: &Id) -> Result<(), sqlx::Error> {
    sqlx::query("DELETE FROM cards
                 WHERE cid=?
                 AND cstate=?;")
        .bind(card_id)
        .bind(CardState::Requested as i32)
        .execute(sql.pool())
        .await?;

    Ok(())
}
