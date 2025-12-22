use crate::sql::Sql;
use crate::shared::Id;
use crate::shared::card::data::{CardState, Card};

pub async fn card_request_accept(sql: &Sql, card_id: &Id) -> Result<(), sqlx::Error> {
    sqlx::query("UPDATE cards
                 SET cstate=?
                 WHERE cid=?
                 AND cstate=?;")
        .bind(CardState::Created as i32)
        .bind(card_id)
        .bind(CardState::Requested as i32)
        .execute(sql.pool())
        .await?;

    Ok(())
}


pub async fn card_request_accept_update(sql: &Sql, card_id: &Id, update_card: &Card) -> Result<(), sqlx::Error> {
    let mut transaction = sql.pool().begin().await?;

    sqlx::query("UPDATE cards
                 SET cname=?, ctid=?
                 WHERE cid=?
                 AND cstate=?;")
        .bind(&update_card.card_info.name)
        .bind(&update_card.card_type.id)
        .bind(&card_id)
        .bind(CardState::Created as i32)
        .execute(&mut *transaction)
        .await?;

    sqlx::query("DELETE FROM cardtypes
                 WHERE ctid=?;")
        .bind(&update_card.card_info.id)
        .execute(&mut *transaction)
        .await?;

    transaction.commit().await?;

    Ok(())
}

pub async fn card_remove_duplicates(sql: &Sql, collector_id: &Id, card_id: &Id) -> Result<(), sqlx::Error> {
    sqlx::query(
        "DELETE FROM cards WHERE cards.cid IN (
            SELECT cards.cid FROM cards, cardtypes
            WHERE cards.ctid = cardtypes.ctid
            AND cardtypes.coid = ?
            AND cards.cid <> ?
            AND cards.cname IN(
                SELECT cname FROM cards
                WHERE cid = ?
            )
         );")
        .bind(collector_id)
        .bind(card_id)
        .bind(card_id)
        .execute(sql.pool())
        .await?;

    Ok(())
}
