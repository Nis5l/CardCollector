use sqlx::Acquire;

use crate::sql::Sql;
use crate::shared::Id;
use super::data::{TradeStatus, TradeDb};

pub async fn set_trade_status(sql: &Sql, trade_id: &Id, status: TradeStatus) -> Result<(), sqlx::Error> {
    let mut con = sql.get_con().await?;
    let mut transaction = con.begin().await?;

    sqlx::query(
        "UPDATE trades
         SET tstatusone=?, tstatustwo=?
         WHERE tid=?;")
        .bind(status as i32)
        .bind(status as i32)
        .bind(trade_id)
        .execute(&mut transaction)
        .await?;

    transaction.commit().await?;

    Ok(())
}

pub async fn set_trade_status_one(sql: &Sql, user_id: &Id, user_friend_id: &Id, status_self: TradeStatus) -> Result<(), sqlx::Error> {
    let mut con = sql.get_con().await?;
    let mut transaction = con.begin().await?;

    sqlx::query("UPDATE trades
                 SET tstatusone=?
                 WHERE uidone=? AND uidtwo=?;")
        .bind(status_self as i32)
        .bind(user_id)
        .bind(user_friend_id)
        .execute(&mut transaction)
        .await?;

    sqlx::query("UPDATE trades
                 SET tstatustwo=?
                 WHERE uidtwo=? AND uidone=?;")
        .bind(status_self as i32)
        .bind(user_id)
        .bind(user_friend_id)
        .execute(&mut transaction)
        .await?;

    transaction.commit().await?;

    Ok(())
}

pub async fn card_in_trade(sql: &Sql, card_unlocked_id: &Id) -> Result<bool, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let (count, ): (i64, ) = sqlx::query_as(
        "SELECT COUNT(*)
         FROM tradecards
         WHERE cuid=?;")
        .bind(card_unlocked_id)
        .fetch_one(&mut con)
        .await?;

    Ok(count != 0)
}

pub async fn trade_add_card(sql: &Sql, trade_id: &Id, card_unlocked_id: &Id) -> Result<(), sqlx::Error> {
    let mut con = sql.get_con().await?;

    sqlx::query(
        "INSERT INTO tradecards
         (tid, cuid)
         VALUES
         (?, ?);")
        .bind(trade_id)
        .bind(card_unlocked_id)
        .execute(&mut con)
        .await?;

    Ok(())
}

pub async fn suggestion_in_trade(sql: &Sql, trade_id: &Id, card_unlocked_id: &Id) -> Result<bool, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let (count, ): (i64, ) = sqlx::query_as(
        "SELECT COUNT(*)
         FROM tradesuggestions
         WHERE tid=?
         AND cuid=?")
        .bind(trade_id)
        .bind(card_unlocked_id)
        .fetch_one(&mut con)
        .await?;

    Ok(count != 0)
}

pub async fn user_has_suggestions_in_trade(sql: &Sql, trade_id: &Id, user_id: &Id) -> Result<bool, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let (count, ): (i64, ) = sqlx::query_as(
        "SELECT COUNT(*)
         FROM tradesuggestions, cardunlocks
         WHERE tid=?
         AND cardunlocks.uid=?
         AND tradesuggestions.cuid=cardunlocks.cuid")
        .bind(trade_id)
        .bind(user_id)
        .fetch_one(&mut con)
        .await?;

    Ok(count != 0)
}

//NOTE: this has to be called not just by confirm
pub async fn create_trade(sql: &Sql, id: &Id, user_id: &Id, user_friend_id: &Id, collector_id: &Id) -> Result<Id, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let res: Result<(Id, ), sqlx::Error> = sqlx::query_as(
        "SELECT tid
         FROM trades
         WHERE (uidone=? AND uidtwo=?) OR (uidtwo=? AND uidone=?)
         AND coid=?;")
        .bind(user_id)
        .bind(user_friend_id)
        .bind(user_id)
        .bind(user_friend_id)
        .bind(collector_id)
        .fetch_one(&mut con)
        .await;

    if let Ok((id,)) = res {
        return Ok(id);
    }

    sqlx::query(
        "INSERT INTO trades
         (tid, uidone, uidtwo, coid, tstatusone, tstatustwo)
         VALUES
         (?, ?, ?, ?, 0, 0)")
        .bind(id)
        .bind(user_id)
        .bind(user_friend_id)
        .bind(collector_id)
        .execute(&mut con)
        .await?;

    Ok(id.clone())
}

pub async fn get_trade(sql: &Sql, user_id: &Id, trade_id: &Id) -> Result<TradeDb, sqlx::Error> {
    let mut con = sql.get_con().await?;

    sqlx::query_as(
        "SELECT tstatusone as selfStatus, tstatustwo as friendStatus, tlasttrade as lastTrade
         FROM trades
         WHERE uidone=? AND tid=?
         UNION
         SELECT tstatustwo as selfStatus, tstatusone as friendStatus, tlasttrade as lastTrade
         FROM trades
         WHERE uidtwo=? AND tid=?")
        .bind(user_id)
        .bind(trade_id)
        .bind(user_id)
        .bind(trade_id)
        .fetch_one(&mut con)
        .await
}
