use crate::sql::Sql;
use crate::shared::card::data::{UnlockedCardDb, UnlockedCard};
use crate::shared::Id;

pub async fn trade_cards(sql: &Sql, user_id: &Id, trade_id: &Id) -> Result<Vec<UnlockedCard>, sqlx::Error> {
    let cards_db: Vec<UnlockedCardDb> = sqlx::query_as(
        "SELECT
         cardunlocks.cuid,
         cardunlocks.uid AS cuuid,
         cardunlocks.culevel,
         cardunlocks.cuquality,
         cardunlocks.cutime,
         cards.cid,
         cards.uid AS ccuid,
         cards.cname,
         cards.ctime,
         cards.cstate,
         cardtypes.ctid,
         cardtypes.ctname,
         cardtypes.uid AS ctuid,
         cardtypes.coid,
         cardtypes.cttime,
         cardtypes.ctstate,
         cardframes.cfid,
         cardframes.cfname,
         cardeffects.ceid,
         cardeffects.ceopacity
         FROM (tradecards, cardunlocks, cards, cardtypes)
         LEFT JOIN cardframes ON cardframes.cfid = cardunlocks.cfid
         LEFT JOIN cardeffects ON cardeffects.ceid = cardunlocks.culevel
         WHERE
         cardunlocks.cid = cards.cid AND
         cards.ctid = cardtypes.ctid AND
         cardunlocks.cuid = tradecards.cuid AND
         tradecards.tid=? AND cardunlocks.uid=?;")
         .bind(trade_id)
         .bind(user_id)
         .fetch_all(sql.pool())
         .await?;

    let cards = cards_db.into_iter().map(UnlockedCard::from).collect();

    Ok(cards)
}

pub async fn trade_suggestions(sql: &Sql, user_id: &Id, trade_id: &Id) -> Result<Vec<UnlockedCard>, sqlx::Error> {
    let cards_db: Vec<UnlockedCardDb> = sqlx::query_as(
        "SELECT
         cardunlocks.cuid,
         cardunlocks.uid AS cuuid,
         cardunlocks.culevel,
         cardunlocks.cuquality,
         cardunlocks.cutime,
         cards.cid,
         cards.uid AS ccuid,
         cards.cname,
         cards.ctime,
         cards.cstate,
         cardtypes.ctid,
         cardtypes.ctname,
         cardtypes.uid AS ctuid,
         cardtypes.coid,
         cardtypes.cttime,
         cardtypes.ctstate,
         cardframes.cfid,
         cardframes.cfname,
         cardeffects.ceid,
         cardeffects.ceopacity
         FROM (tradesuggestions, cardunlocks, cards, cardtypes)
         LEFT JOIN cardframes ON cardframes.cfid = cardunlocks.cfid
         LEFT JOIN cardeffects ON cardeffects.ceid = cardunlocks.culevel
         WHERE
         cardunlocks.cid = cards.cid AND
         cards.ctid = cardtypes.ctid AND
         cardunlocks.cuid = tradesuggestions.cuid AND
         tradesuggestions.tid=? AND cardunlocks.uid<>?;")
         .bind(trade_id)
         .bind(user_id)
         .fetch_all(sql.pool())
         .await?;

    let cards = cards_db.into_iter().map(UnlockedCard::from).collect();

    Ok(cards)
}
