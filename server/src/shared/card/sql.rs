use sqlx::mysql::MySqlQueryResult;
use std::collections::{HashSet, HashMap};

use crate::sql::Sql;
use super::data::{UnlockedCardCreateData, UnlockedCard, UnlockedCardDb, CardDb, SortType, Card, InventoryOptions, CardState, CardSortType, CardTypeDb, CardType};
use crate::shared::{Id, util};

pub async fn get_card_type_collector_id(sql: &Sql, card_type_id: &Id) -> Result<Id, sqlx::Error> {
    let (id, ): (Id, ) = sqlx::query_as(
        "SELECT coid
         FROM cardtypes
         WHERE ctid=?;")
        .bind(card_type_id)
        .fetch_one(sql.pool())
        .await?;

    Ok(id)
}

pub async fn card_type_exists_created(sql: &Sql, collector_id: &Id, card_type_id: &Id) -> Result<bool, sqlx::Error> {
    let (count, ): (i64, ) = sqlx::query_as(
        "SELECT COUNT(*)
         FROM cardtypes
         WHERE coid=? AND
         ctid=? AND
         ctstate=?;")
        .bind(collector_id)
        .bind(card_type_id)
        .bind(CardState::Created as i32)
        .fetch_one(sql.pool())
        .await?;

    Ok(count != 0)
}

pub async fn get_card_collector_id(sql: &Sql, card_id: &Id) -> Result<Id, sqlx::Error> {
    let (id, ): (Id, ) = sqlx::query_as(
        "SELECT cardtypes.coid
         FROM cards, cardtypes
         WHERE cards.ctid = cardtypes.ctid
         AND cards.cid = ?;")
        .bind(card_id)
        .fetch_one(sql.pool())
        .await?;

    Ok(id)
}

pub async fn card_exists(sql: &Sql, card_id: &Id) -> Result<bool, sqlx::Error> {
    let (count, ): (i64, ) = sqlx::query_as(
        "SELECT COUNT(*)
         FROM cards
         WHERE cid=?;")
        .bind(card_id)
        .fetch_one(sql.pool())
        .await?;

    Ok(count != 0)
}

//TODO: Think if should also safe collector_id
pub async fn add_card(sql: &Sql, user_id: &Id, card_unlocked_id: &Id, _collector_id: &Id, card: &UnlockedCardCreateData) -> Result<(), sqlx::Error> {
    sqlx::query(
        "INSERT INTO cardunlocks
         (cuid, uid, cid, cuquality, culevel, cfid, cutime)
         VALUES
         (?, ?, ?, ?, ?, ?, NOW());")
        .bind(card_unlocked_id)
        .bind(user_id)
        .bind(&card.card_id)
        .bind(card.quality)
        .bind(card.level)
        .bind(card.frame_id)
        .execute(sql.pool())
        .await?;
    Ok(())
}

pub async fn get_unlocked_card(sql: &Sql, card_unlocked_id: &Id, user_id: Option<&Id>) -> Result<Option<UnlockedCard>, sqlx::Error> {
    let mut cards = get_unlocked_cards(sql, vec![card_unlocked_id.clone()], user_id).await?;

    if cards.is_empty() {
        return Ok(None);
    }

    Ok(Some(cards.remove(0)))
}

pub async fn get_unlocked_cards(sql: &Sql, card_unlocked_ids: Vec<Id>, user_id: Option<&Id>) -> Result<Vec<UnlockedCard>, sqlx::Error> {
    if card_unlocked_ids.is_empty() { return Ok(Vec::new()); }

    let mut in_statement = String::from("");

    for i in 0..card_unlocked_ids.len() {
        in_statement += "?";
        if i != card_unlocked_ids.len() - 1 {
            in_statement += ",";
        }
    }

    let extra_checks = if user_id.is_some() {
        "AND cardunlocks.uid = ?"
    } else {
        ""
    };

    let query = format!(
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
         cards.cstate AS cardState,
         cardtypes.ctid AS typeId,
         cardtypes.ctname AS typeName,
         cardtypes.uid AS cardTypeUserId,
         cardtypes.coid AS collectorId,
         cardtypes.ctstate AS typeState,
         cardtypes.cttime AS typeTime,
         cardframes.cfid AS frameId,
         cardframes.cfname AS frameName,
         cardeffects.ceid AS effectId,
         cardeffects.ceopacity AS effectOpacity
         FROM (cardunlocks, cards, cardtypes)
         LEFT JOIN cardframes ON cardframes.cfid = cardunlocks.cfid
         LEFT JOIN cardeffects ON cardeffects.ceid = cardunlocks.culevel
         WHERE
         cardunlocks.cid = cards.cid AND
         cards.ctid = cardtypes.ctid AND
         cardunlocks.cuid IN({})
         {}",
         in_statement,
         extra_checks);

    let mut stmt = sqlx::query_as(&query);

    for uuid in card_unlocked_ids {
        stmt = stmt.bind(uuid);
    }

    if let Some(id) = user_id {
        stmt = stmt.bind(id);
    }

    let cards_db: Vec<UnlockedCardDb> = stmt.fetch_all(sql.pool()).await?;

    Ok(cards_db.into_iter().map(UnlockedCard::from).collect())
}

pub async fn delete_card(sql: &Sql, card_unlocked_id: &Id) -> Result<u64, sqlx::Error> {
    let result: MySqlQueryResult = sqlx::query(
        "DELETE FROM cardunlocks
         WHERE cuid=?;")
        .bind(card_unlocked_id)
        .execute(sql.pool())
        .await?;

    Ok(result.rows_affected())
}

pub async fn user_owns_card(sql: &Sql, user_id: &Id, card_unlocked_id: &Id, collector_id: Option<&Id>) -> Result<bool, sqlx::Error> {
    let query = match collector_id {
        None =>
            "SELECT COUNT(*)
             FROM cardunlocks
             WHERE uid=?
             AND cuid=?;",
        Some(_) =>
            "SELECT COUNT(*)
             FROM cardunlocks, cards, cardtypes
             WHERE cards.cid=cardunlocks.cid
             AND cardtypes.ctid = cards.ctid
             AND cardunlocks.uid=?
             AND cardunlocks.cuid=?
             AND cardtypes.coid=?;"
    };

    let mut stmt = sqlx::query_as(query)
        .bind(user_id)
        .bind(card_unlocked_id);

    match collector_id {
        None => (),
        Some(_) => { stmt = stmt.bind(collector_id); }
    }

    let (count, ): (i64, ) = stmt.fetch_one(sql.pool()).await?;

    Ok(count != 0)
}

fn order_by_string_from_sort_type(sort_type: &SortType) -> &str {
    match sort_type {
        SortType::Name => 
            "cards.cname,
             cardtypes.ctname,
             cardunlocks.culevel DESC,
             cardunlocks.cuquality DESC,
             cardunlocks.cutime DESC",
        SortType::CardType => 
            "cardtypes.ctname,
             cards.cname,
             cardunlocks.culevel DESC,
             cardunlocks.cuquality DESC,
             cardunlocks.cutime DESC",
        SortType::Level => 
            "cardunlocks.culevel DESC,
             cardunlocks.cuquality DESC,
             cards.cname,
             cardtypes.ctname,
             cardunlocks.cutime DESC",
        SortType::Recent => 
            "cardunlocks.cutime DESC"
    }
}

pub async fn get_inventory(sql: &Sql, options: &InventoryOptions) -> Result<Vec<UnlockedCard>, sqlx::Error> {
    let search = util::escape_for_like(options.search.clone());

    let order_by = order_by_string_from_sort_type(&options.sort_type);

    let mut extra_conditions: Vec<String> = Vec::new();

    if options.level.is_some() {
        extra_conditions.push(String::from("cardunlocks.culevel = ?"));
    }

    if options.card_id.is_some() {
        extra_conditions.push(String::from("cards.cid = ?"));
    }

    if !options.exclude_uuids.is_empty() {
        extra_conditions.push(format!("cardunlocks.cuid NOT IN ({})", vec!["?"; options.exclude_uuids.len()].join(",")));
    }

    let extra_conditions_str = if extra_conditions.is_empty() {
        String::new()
    } else {
        format!("{} AND", extra_conditions.join(" AND "))
    };

    let query = format!(
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
         cards.cstate AS cardState,
         cardtypes.ctid AS typeId,
         cardtypes.ctname AS typeName,
         cardtypes.uid AS cardTypeUserId,
         cardtypes.coid AS collectorId,
         cardtypes.ctstate AS typeState,
         cardtypes.cttime AS typeTime,
         cardframes.cfid AS frameId,
         cardframes.cfname AS frameName,
         cardeffects.ceid AS effectId,
         cardeffects.ceopacity AS effectOpacity
         FROM (cardunlocks, cards, cardtypes)
         LEFT JOIN cardframes ON cardframes.cfid = cardunlocks.cfid
         LEFT JOIN cardeffects ON cardeffects.ceid = cardunlocks.culevel
         WHERE
         {}
         cardunlocks.cid = cards.cid
         AND cards.ctid = cardtypes.ctid
         AND cardtypes.coid=?
         AND cardunlocks.uid=?
         AND (cards.cname LIKE CONCAT('%', ?, '%') OR cardtypes.ctname LIKE CONCAT('%', ?, '%'))
         ORDER BY
         {}
         LIMIT ? OFFSET ?;",
         extra_conditions_str,
         order_by);

    let mut stmt = sqlx::query_as(&query);

    if let Some(level) = options.level {
        stmt = stmt.bind(level);
    }

    if let Some(card_id) = &options.card_id {
        stmt = stmt.bind(card_id);
    }

    for exclude_id in &options.exclude_uuids {
        stmt = stmt.bind(exclude_id);
    }

    let cards_db: Vec<UnlockedCardDb> = stmt.bind(&options.collector_id)
        .bind(&options.user_id)
        .bind(&search)
        .bind(&search)
        .bind(options.count)
        .bind(options.offset)
        .fetch_all(sql.pool())
        .await?;

    Ok(cards_db.into_iter().map(UnlockedCard::from).collect())
}

//TODO: maybe replace InventoryOptions since page data is not used
pub async fn get_inventory_count(sql: &Sql, options: &InventoryOptions) -> Result<u32, sqlx::Error> {
    let search = util::escape_for_like(options.search.clone());

    let order_by = order_by_string_from_sort_type(&options.sort_type);

    let mut extra_conditions: Vec<String> = Vec::new();

    if options.level.is_some() {
        extra_conditions.push(String::from("cardunlocks.culevel = ?"));
    }

    if options.card_id.is_some() {
        extra_conditions.push(String::from("cards.cid = ?"));
    }

    if !options.exclude_uuids.is_empty() {
        extra_conditions.push(format!("cardunlocks.cuid NOT IN ({})", vec!["?"; options.exclude_uuids.len()].join(",")));
    }

    let extra_conditions_str = if extra_conditions.is_empty() {
        String::new()
    } else {
        format!("{} AND", extra_conditions.join(" AND "))
    };

    let query = format!(
        "SELECT COUNT(*)
         FROM (cardunlocks, cards, cardtypes)
         LEFT JOIN cardframes ON cardframes.cfid = cardunlocks.cfid
         LEFT JOIN cardeffects ON cardeffects.ceid = cardunlocks.culevel
         WHERE
         {}
         cardunlocks.cid = cards.cid
         AND cards.ctid = cardtypes.ctid
         AND cardtypes.coid=?
         AND cardunlocks.uid=?
         AND (cards.cname LIKE CONCAT('%', ?, '%') OR cardtypes.ctname LIKE CONCAT('%', ?, '%'))
         ORDER BY
         {};",
         extra_conditions_str,
         order_by);

    let mut stmt = sqlx::query_as(&query);

    if let Some(level) = options.level {
        stmt = stmt.bind(level);
    }

    if let Some(card_id) = &options.card_id {
        stmt = stmt.bind(card_id);
    }

    for exclude_id in &options.exclude_uuids {
        stmt = stmt.bind(exclude_id);
    }

    let (count, ): (i64, ) = stmt
        .bind(&options.collector_id)
        .bind(&options.user_id)
        .bind(&search)
        .bind(&search)
        .fetch_one(sql.pool())
        .await?;

    Ok(count as u32)
}

pub fn order_by_string_from_card_sort_type(sort_type: &CardSortType) -> &str {
    match sort_type {
        CardSortType::Name => 
            "cards.cname,
             cardtypes.ctname,
             cards.ctime DESC",
        CardSortType::CardType => 
            "cardtypes.ctname,
             cards.cname,
             cards.ctime DESC",
        CardSortType::Recent => 
            "cards.ctime DESC"
    }
}

pub async fn get_card(sql: &Sql, collector_id: &Id, card_id: &Id) -> Result<Option<Card>, sqlx::Error> {
    let query = "SELECT
                 cards.cid AS cardId,
                 cards.uid AS cardUserId,
                 cards.cname AS cardName,
                 cards.ctime AS cardTime,
                 cards.cupdatectid AS updateCard,
                 cards.cstate AS cardState,
                 cardtypes.ctid AS typeId,
                 cardtypes.ctname AS typeName,
                 cardtypes.coid AS collectorId,
                 cardtypes.uid AS cardTypeUserId,
                 cardtypes.ctstate AS typeState,
                 cardtypes.cttime AS typeTime
                 FROM cards, cardtypes
                 WHERE
                 cards.ctid = cardtypes.ctid
                 AND cards.cid=?
                 AND cardtypes.coid=?;";

    let stmt = sqlx::query_as(query).bind(card_id).bind(collector_id).fetch_one(sql.pool()).await;

    if let Err(sqlx::Error::RowNotFound) = stmt {
        return Ok(None);
    }

    let card_db: CardDb = stmt?;

    let reference_db: Option<CardDb> = match card_db.update_card {
        Some(ref id) => Some(sqlx::query_as(query).bind(id).bind(collector_id).fetch_one(sql.pool()).await?),
        None => None
    };

    return Ok(Some(Card::from((card_db, reference_db))));
}

pub async fn get_cards(sql: &Sql, collector_id: &Id, mut name: String, sort_type: &CardSortType, amount: u32, offset: u32, state: Option<CardState>) -> Result<Vec<Card>, sqlx::Error> {
    name = util::escape_for_like(name);

    let order_by = order_by_string_from_card_sort_type(sort_type);

    let query = format!(
        "SELECT
         cards.cid AS cardId,
         cards.uid AS cardUserId,
         cards.cname AS cardName,
         cards.ctime AS cardTime,
         cards.cupdatectid AS updateCard,
         cards.cstate AS cardState,
         cardtypes.ctid AS typeId,
         cardtypes.ctname AS typeName,
         cardtypes.coid AS collectorId,
         cardtypes.uid AS cardTypeUserId,
         cardtypes.ctstate AS typeState,
         cardtypes.cttime AS typeTime
         FROM cards, cardtypes
         WHERE
         cards.ctid = cardtypes.ctid
         AND (cards.cname LIKE CONCAT('%', ?, '%') OR cardtypes.ctname LIKE CONCAT('%', ?, '%'))
         AND cardtypes.coid = ?
         {}
         ORDER BY
         {}
         LIMIT ? OFFSET ?;",
         match state {
            Some(_) => "AND cards.cstate = ?",
            None => ""
         },
         order_by
    );

    let mut stmt = sqlx::query_as(&query)
         .bind(&name)
         .bind(&name)
         .bind(collector_id);

    if let Some(state) = state {
        stmt = stmt.bind(state as i64);
    }

    stmt = stmt.bind(amount).bind(offset);

    let cards_db: Vec<CardDb> = stmt.fetch_all(sql.pool()).await?;

    let card_reference_ids: Vec<Id> = cards_db
        .iter()
        .filter_map(|ct| ct.update_card.clone())
        .collect::<HashSet<_>>()
        .into_iter()
        .collect();

    let update_card_map: HashMap<Id, Card> = if !card_reference_ids.is_empty() {
        let query = format!(
            "SELECT
             cards.cid AS cardId,
             cards.uid AS cardUserId,
             cards.cname AS cardName,
             cards.ctime AS cardTime,
             cards.cupdatectid AS updateCard,
             cards.cstate AS cardState,
             cardtypes.ctid AS typeId,
             cardtypes.ctname AS typeName,
             cardtypes.coid AS collectorId,
             cardtypes.uid AS cardTypeUserId,
             cardtypes.ctstate AS typeState,
             cardtypes.cttime AS typeTime
             FROM cards, cardtypes
             WHERE
             cards.ctid = cardtypes.ctid
             AND cid IN ({});",
             card_reference_ids.iter().map(|_| "?").collect::<Vec<_>>().join(",")
        );

        let mut q = sqlx::query_as(&query);
        for id in &card_reference_ids {
            q = q.bind(id);
        }

        let rows: Vec<CardDb> = q.fetch_all(sql.pool()).await?;

        rows.into_iter()
            .map(|u| {
                let c = Card::from(u);
                (c.card_info.id.clone(), c)
            })
            .collect()
    } else {
        HashMap::new()
    };

    let result: Vec<Card> = cards_db
        .into_iter()
        .map(|c_db| {
            let update_card = c_db
                .update_card.as_ref()
                .and_then(|id| update_card_map.get(id).cloned());

            Card::from((c_db, update_card))
        })
        .collect();

    Ok(result)
}

pub async fn get_card_type(sql: &Sql, collector_id: &Id, card_type_id: &Id) -> Result<CardType, sqlx::Error> {
    let query = "SELECT ctid, uid, ctname, ctstate, ctupdatectid
                 FROM cardtypes
                 WHERE ctid = ? AND coid=?;";

    let card_type_db: CardTypeDb = sqlx::query_as(query)
        .bind(card_type_id)
        .bind(collector_id)
        .fetch_one(sql.pool())
        .await?;

    let reference_db: Option<CardTypeDb> = match card_type_db.ctupdatectid {
        Some(ref id) => Some(sqlx::query_as(query).bind(id).bind(collector_id).fetch_one(sql.pool()).await?),
        None => None
    };

    Ok(CardType::from((card_type_db, reference_db)))
}
