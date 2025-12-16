use crate::sql::Sql;
use crate::shared::card::data::{UnlockedCardDb, UnlockedCard};
use crate::config::Config;
use crate::shared::Id;

//TODO: dont pass config
pub async fn trade_cards(sql: &Sql, user_id: &Id, trade_id: &Id, config: &Config) -> Result<Vec<UnlockedCard>, sqlx::Error> {
    let cards_db: Vec<UnlockedCardDb> = sqlx::query_as(
        "SELECT
         cardunlocks.cuid AS id,
         cardunlocks.uid AS userId,
         cardunlocks.culevel AS level,
         cardunlocks.cuquality AS quality,
         cardunlocks.cutime AS time,
         cards.cid AS cardId,
         cards.uid AS cardUserId,
         cards.cname AS cardName,
         cards.ctime AS cardTime,
         cardtypes.ctid AS typeId,
         cardtypes.ctname AS typeName,
         cardtypes.uid AS cardTypeUserId,
         cardtypes.coid AS collectorId,
         cardframes.cfid AS frameId,
         cardframes.cfname AS frameName,
         cardeffects.ceid AS effectId,
         cardeffects.ceopacity AS effectOpacity
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

    let cards = cards_db.into_iter().map(|card_db| { UnlockedCard::from_card_db(card_db, config) }).collect();

    Ok(cards)
}

//TODO: dont pass config
pub async fn trade_suggestions(sql: &Sql, user_id: &Id, trade_id: &Id, config: &Config) -> Result<Vec<UnlockedCard>, sqlx::Error> {
    let cards_db: Vec<UnlockedCardDb> = sqlx::query_as(
        "SELECT
         cardunlocks.cuid AS id,
         cardunlocks.uid AS userId,
         cardunlocks.culevel AS level,
         cardunlocks.cuquality AS quality,
         cardunlocks.cutime AS time,
         cards.cid AS cardId,
         cards.uid AS cardUserId,
         cards.cname AS cardName,
         cards.ctime AS cardTime,
         cardtypes.ctid AS typeId,
         cardtypes.ctname AS typeName,
         cardtypes.uid AS cardTypeUserId,
         cardtypes.coid AS collectorId,
         cardframes.cfid AS frameId,
         cardframes.cfname AS frameName,
         cardeffects.ceid AS effectId,
         cardeffects.ceopacity AS effectOpacity
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

    let cards = cards_db.into_iter().map(|card_db| { UnlockedCard::from_card_db(card_db, config) }).collect();

    Ok(cards)
}
