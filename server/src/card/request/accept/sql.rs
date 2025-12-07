use crate::sql::Sql;
use crate::shared::Id;
use crate::shared::card::data::CardState;

pub async fn card_request_accept(sql: &Sql, card_id: &Id) -> Result<(), sqlx::Error> {
    let mut con = sql.get_con().await?;

    sqlx::query("UPDATE cards
                 SET cstate=?
                 WHERE cid=?
                 AND cstate=?;")
        .bind(CardState::Created as i32)
        .bind(card_id)
        .bind(CardState::Requested as i32)
        .execute(&mut con)
        .await?;

    Ok(())
}

pub async fn card_remove_duplicates(sql: &Sql, collector_id: &Id, card_id: &Id) -> Result<(), sqlx::Error> {
    let mut con = sql.get_con().await?;

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
        .execute(&mut con)
        .await?;

    Ok(())
}
