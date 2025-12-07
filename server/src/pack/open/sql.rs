use sqlx::mysql::MySqlQueryResult;
use chrono::{DateTime, Utc};

use crate::sql::Sql;
use crate::shared::Id;
use crate::shared::card::data::CardState;
use super::data::CardCreateDataDb;

pub async fn set_pack_time(sql: &Sql, user_id: &Id, collector_id: &Id, last_opened: DateTime<Utc>) -> Result<(), sqlx::Error> {
    let mut con = sql.get_con().await?;

    let result: MySqlQueryResult = sqlx::query(
        "UPDATE packtimes
         SET ptlastopened=?
         WHERE uid=?
         AND coid=?;")
        .bind(last_opened)
        .bind(user_id)
        .bind(collector_id)
        .execute(&mut con)
        .await?;

    if result.rows_affected() == 0 {
        sqlx::query(
            "INSERT INTO packtimes
             (uid, coid, ptlastopened)
             VALUES
             (?, ?, ?);")
            .bind(user_id)
            .bind(collector_id)
            .bind(last_opened)
            .execute(&mut con)
            .await?;
    }

    Ok(())
}

pub async fn get_random_card_data(sql: &Sql, card_amount: u32, collector_id: &Id) -> Result<Vec<CardCreateDataDb>, sqlx::Error> {
    let mut con = sql.get_con().await?;

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
        .fetch_all(&mut con)
        .await?;

    Ok(cards)
}
