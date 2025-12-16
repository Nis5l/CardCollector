use chrono::{DateTime, Utc};

use crate::sql::Sql;
use crate::shared::Id;
use crate::shared::card::data::CardState;
use super::data::CardCreateDataDb;

pub async fn set_pack_time(sql: &Sql, user_id: &Id, collector_id: &Id, last_opened: DateTime<Utc>) -> Result<(), sqlx::Error> {
    sqlx::query(
        "INSERT INTO packtimes (uid, coid, ptlastopened)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE ptlastopened = VALUES(ptlastopened);"
    )
    .bind(user_id)
    .bind(collector_id)
    .bind(last_opened)
    .execute(sql.pool())
    .await?;

    Ok(())
}

pub async fn get_random_card_data(sql: &Sql, card_amount: u32, collector_id: &Id) -> Result<Vec<CardCreateDataDb>, sqlx::Error> {
    let cards: Vec<CardCreateDataDb> = sqlx::query_as(
        "SELECT
         cards.cid AS cardId,
         cards.uid AS cardUserId
         FROM
         cards, cardtypes
         WHERE 
         cardtypes.ctid = cards.ctid
         AND cardtypes.coid=?
         AND cards.cstate=?
         ORDER BY
         RAND()
         LIMIT ?;")
        .bind(collector_id)
        .bind(CardState::Created as u32)
        .bind(card_amount)
        .fetch_all(sql.pool())
        .await?;

    Ok(cards)
}
