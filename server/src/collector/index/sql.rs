use super::data::CollectorSortType;
use crate::{shared::collector::Collector, sql::Sql};
use crate::shared::util;

pub async fn get_collectors(sql: &Sql, mut search: String, sort_type: CollectorSortType, amount: u32, offset: u32) -> Result<Vec<Collector>, sqlx::Error> {
    search = util::escape_for_like(search);

    let order_by = match sort_type {
        CollectorSortType::Name => "collectors.coname",
        CollectorSortType::Recent => "collectors.cotime",
        CollectorSortType::MostUsers => "(SELECT COUNT(DISTINCT cardunlocks.uid) FROM users, cardunlocks, cards, cardtypes WHERE users.uid = cardunlocks.uid AND cardunlocks.cid = cards.cid AND cards.ctid = cardtypes.ctid AND cardtypes.coid = collectors.coid) DESC",
        CollectorSortType::MostCards => "(SELECT COUNT(*) FROM cardunlocks, cards, cardtypes WHERE cardunlocks.cid = cards.cid AND cards.ctid = cardtypes.ctid AND cardtypes.coid = collectors.coid) DESC",
    };

    let collectors = sqlx::query_as(&format!(
        "SELECT coid as id,
                coname as name,
                codescription as description,
                uid as userId
         FROM collectors
         WHERE coname LIKE CONCAT('%', ?, '%')
         ORDER BY {}
         LIMIT ? OFFSET ?;", order_by))
        .bind(search)
        .bind(amount)
        .bind(offset)
        .fetch_all(sql.pool())
        .await?;

    Ok(collectors)
}

pub async fn get_collectors_count(sql: &Sql, mut search: String) -> Result<u32, sqlx::Error> {
    search = util::escape_for_like(search);

    let (count, ): (i64, ) = sqlx::query_as(
        "SELECT COUNT(*)
         FROM collectors
         WHERE coname LIKE CONCAT('%', ?, '%');")
        .bind(search)
        .fetch_one(sql.pool())
        .await?;

    Ok(count as u32)
}
