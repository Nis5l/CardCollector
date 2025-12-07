use crate::sql::Sql;
use crate::shared::{util, Id};
use crate::shared::card::data::CardState;

pub async fn get_card_count(sql: &Sql, collector_id: &Id, mut name: String, state: Option<CardState>) -> Result<u32, sqlx::Error> {
    let mut con = sql.get_con().await?;

    name = util::escape_for_like(name);

    let query = format!(
        "SELECT COUNT(*)
         FROM cards, cardtypes
         WHERE cards.ctid = cardtypes.ctid
         AND (cards.cname LIKE CONCAT('%', ?, '%') OR cardtypes.ctname LIKE CONCAT('%', ?, '%'))
         AND cardtypes.coid = ?
         {};",
             match state {
                Some(_) => "AND cards.cstate = ?",
                None => ""
            }
        );

    let mut stmt = sqlx::query_as(&query)
        .bind(&name)
        .bind(&name)
        .bind(collector_id);

    if let Some(state) = state {
        stmt = stmt.bind(state as i32);
    }

    let (count, ): (i64, ) = stmt.fetch_one(&mut con).await?;

    Ok(count as u32)
}
