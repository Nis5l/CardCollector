use crate::sql::Sql;
use crate::shared::Id;
use crate::shared::card::data::{CardState, CardType};

pub async fn card_type_request_accept(sql: &Sql, card_type_id: &Id) -> Result<(), sqlx::Error> {
    sqlx::query("UPDATE cardtypes
                 SET ctstate=?
                 WHERE ctid=?
                 AND ctstate=?;")
        .bind(CardState::Created as i32)
        .bind(card_type_id)
        .bind(CardState::Requested as i32)
        .execute(sql.pool())
        .await?;

    Ok(())
}

pub async fn card_type_request_accept_update(sql: &Sql, card_type_id: &Id, update_card_type: &CardType) -> Result<(), sqlx::Error> {
    let mut transaction = sql.pool().begin().await?;

    sqlx::query("UPDATE cardtypes
                 SET ctname=?
                 WHERE ctid=?
                 AND ctstate=?;")
        .bind(&update_card_type.name)
        .bind(card_type_id)
        .bind(CardState::Created as i32)
        .execute(&mut *transaction)
        .await?;

    sqlx::query("DELETE FROM cardtypes
                 WHERE ctid=?;")
        .bind(&update_card_type.id)
        .execute(&mut *transaction)
        .await?;

    transaction.commit().await?;

    Ok(())
}

pub async fn card_type_remove_duplicates(sql: &Sql, collector_id: &Id, card_type_id: &Id) -> Result<(), sqlx::Error> {
    sqlx::query(
        "DELETE FROM cardtypes
         WHERE coid = ? AND
         ctid <> ? AND
         ctname IN(
             SELECT ctname
             FROM cardtypes
             WHERE ctid = ?
         );")
        .bind(collector_id)
        .bind(card_type_id)
        .bind(card_type_id)
        .execute(sql.pool())
        .await?;

    Ok(())
}
