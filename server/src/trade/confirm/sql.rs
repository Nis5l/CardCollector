use sqlx::Acquire;
use sqlx::mysql::MySqlQueryResult;
use chrono::Utc;

use crate::sql::Sql;
use crate::shared::Id;

//transfers the cards, clears the trade and sets the cooldown
pub async fn complete_trade(sql: &Sql, trade_id: &Id) -> Result<u64, sqlx::Error> {
    let mut con = sql.get_con().await?;
    let mut transaction = con.begin().await?;

    let mut transfered_card_count = 0;

    transfered_card_count += (sqlx::query(
            "UPDATE cardunlocks, trades, tradecards
             SET cardunlocks.uid=trades.uidone
             WHERE cardunlocks.cuid = tradecards.cuid
             AND tradecards.tid = trades.tid
             AND trades.tid=?
             AND cardunlocks.uid<>trades.uidone;")
        .bind(trade_id)
        .execute(&mut transaction)
        .await? as MySqlQueryResult).rows_affected();

    transfered_card_count += (sqlx::query(
            "UPDATE cardunlocks, trades, tradecards
             SET cardunlocks.uid=trades.uidone
             WHERE cardunlocks.cuid = tradecards.cuid
             AND tradecards.tid = trades.tid
             AND trades.tid=?
             AND cardunlocks.uid<>trades.uidtwo;")
        .bind(trade_id)
        .execute(&mut transaction)
        .await? as MySqlQueryResult).rows_affected();

    sqlx::query(
        "DELETE FROM tradecards
         WHERE tid=?")
        .bind(trade_id)
        .execute(&mut transaction)
        .await?;

    sqlx::query(
        "DELETE FROM tradesuggestions
         WHERE tid=?")
        .bind(trade_id)
        .execute(&mut transaction)
        .await?;

    sqlx::query(
        "UPDATE trades
         SET tlasttrade=?
         WHERE tid=?")
        .bind(Utc::now())
        .bind(trade_id)
        .execute(&mut transaction)
        .await?;

    transaction.commit().await?;

    Ok(transfered_card_count)
}
