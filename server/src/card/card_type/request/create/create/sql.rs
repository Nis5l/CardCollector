use crate::sql::Sql;
use crate::shared::Id;
use crate::shared::card::data::CardState;

pub async fn card_type_create_request_create(sql: &Sql, card_type_id: &Id, collector_id: &Id, user_id: &Id, name: &str) -> Result<(), sqlx::Error> {
    sqlx::query("INSERT INTO cardtypes
                 (ctid, coid, uid, ctname, ctstate)
                 VALUES
                 (?, ?, ?, ?, ?)")
        .bind(card_type_id)
        .bind(collector_id)
        .bind(user_id)
        .bind(name)
        .bind(CardState::Requested as i32)
        .execute(sql.pool())
        .await?;

    Ok(())
}
