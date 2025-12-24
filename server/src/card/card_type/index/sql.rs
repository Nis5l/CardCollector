use std::collections::{HashSet, HashMap};

use crate::sql::Sql;
use crate::shared::{util, Id};
use crate::shared::card::data::{CardType, CardTypeDb, CardState, CardTypeSortType};

pub async fn get_card_types(sql: &Sql, collector_id: &Id, mut name: String, sort_type: &CardTypeSortType, amount: u32, offset: u32, state: Option<CardState>) -> Result<Vec<CardType>, sqlx::Error> {
    name = util::escape_for_like(name);

    if let Some(CardState::Delete) = state {
        let query = "
            SELECT d.dctid as ctid, d.uid, c.ctname, ? as ctstate, c.ctupdatectid
            FROM deletecardtypes d
            INNER JOIN cardtypes c ON c.ctid = d.ctid
            WHERE c.coid = ? AND c.ctname LIKE CONCAT('%', ?, '%')
            ORDER BY d.dcttime DESC
            LIMIT ? OFFSET ?;
        ";

        let rows: Vec<CardTypeDb> = sqlx::query_as(query)
            .bind(CardState::Delete as i32)
            .bind(collector_id)
            .bind(name)
            .bind(amount)
            .bind(offset)
            .fetch_all(sql.pool())
            .await?;

        let result: Vec<CardType> = rows.into_iter().map(|ct_db| CardType::from((ct_db, None::<CardType>))).collect();
        return Ok(result);
    }

    let query = format!(
        "SELECT ctid, uid, ctname, ctstate, ctupdatectid
         FROM cardtypes
         WHERE ctname LIKE CONCAT('%', ?, '%') AND
         coid = ?
         {}
         ORDER BY
         {}
         LIMIT ? OFFSET ?;",
             match state {
                Some(_) => "AND ctstate = ?",
                None => ""
            },
             match sort_type {
                CardTypeSortType::Name => "ctname,\ncttime DESC",
                CardTypeSortType::Recent => "cttime DESC",
            }
        );

    let mut stmt = sqlx::query_as(&query)
        .bind(name)
        .bind(collector_id);

    if let Some(state) = state {
        stmt = stmt.bind(state as i32);
    }

    stmt = stmt.bind(amount).bind(offset);

    let card_types_db: Vec<CardTypeDb> = stmt.fetch_all(sql.pool()).await?;

    let card_type_reference_ids: Vec<Id> = card_types_db
        .iter()
        .filter_map(|ct| ct.ctupdatectid.clone())
        .collect::<HashSet<_>>()
        .into_iter()
        .collect();

    let update_card_types_map: HashMap<Id, CardType> = if !card_type_reference_ids.is_empty() {
        let query = format!(
            "SELECT ctid, uid, ctname, ctstate, ctupdatectid
             FROM cardtypes
             WHERE ctid IN ({})",
            card_type_reference_ids.iter().map(|_| "?").collect::<Vec<_>>().join(",")
        );

        let mut q = sqlx::query_as(&query);
        for id in &card_type_reference_ids {
            q = q.bind(id);
        }

        let rows: Vec<CardTypeDb> = q.fetch_all(sql.pool()).await?;

        rows.into_iter()
            .map(|u| {
                let ct = CardType::from(u);
                (ct.id.clone(), ct)
            })
            .collect()
    } else {
        HashMap::new()
    };

    let result: Vec<CardType> = card_types_db
        .into_iter()
        .map(|ct_db| {
            let update_card_type = ct_db
                .ctupdatectid.as_ref()
                .and_then(|id| update_card_types_map.get(id).cloned());

            CardType::from((ct_db, update_card_type))
        })
        .collect();

    Ok(result)
}

pub async fn get_card_type_count(sql: &Sql, collector_id: &Id, mut name: String, state: Option<CardState>) -> Result<u32, sqlx::Error> {
    name = util::escape_for_like(name);

    if let Some(CardState::Delete) = state {
        let query = "
            SELECT COUNT(*)
            FROM deletecardtypes d
            INNER JOIN cardtypes c ON c.ctid = d.ctid
            WHERE c.coid = ? AND c.ctname LIKE CONCAT('%', ?, '%')";

        let (count, ): (i64, ) = sqlx::query_as(query)
            .bind(collector_id)
            .bind(name)
            .fetch_one(sql.pool())
            .await?;

        return Ok(count as u32);
    }

    let query = format!(
        "SELECT COUNT(*) FROM cardtypes
         WHERE ctname LIKE CONCAT('%', ?, '%') AND
         coid = ?
         {};",
             match state {
                Some(_) => "AND ctstate = ?",
                None => ""
            }
        );

    let mut stmt = sqlx::query_as(&query)
        .bind(name)
        .bind(collector_id);

    if let Some(state) = state {
        stmt = stmt.bind(state as i32);
    }

    let (count, ): (i64, ) = stmt.fetch_one(sql.pool()).await?;

    Ok(count as u32)
}
