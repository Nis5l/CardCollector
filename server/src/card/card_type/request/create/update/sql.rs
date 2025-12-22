use crate::sql::Sql;
use crate::shared::Id;
use crate::shared::card::data::CardState;

pub async fn card_type_update_request_create(sql: &Sql, card_type_id: &Id, collector_id: &Id, user_id: &Id, name: &str, refrence_card_type_id: &Id) -> Result<(), sqlx::Error> {
    sqlx::query("INSERT INTO cardtypes
                 (ctid, coid, uid, ctname, ctstate, ctupdatectid)
                 VALUES
                 (?, ?, ?, ?, ?, ?)")
        .bind(card_type_id)
        .bind(collector_id)
        .bind(user_id)
        .bind(name)
        .bind(CardState::Requested as i32)
        .bind(refrence_card_type_id)
        .execute(sql.pool())
        .await?;

    Ok(())
}
