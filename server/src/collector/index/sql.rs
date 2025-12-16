use crate::{shared::collector::Collector, sql::Sql};
use crate::shared::util;

pub async fn get_collectors(sql: &Sql, mut search: String, amount: u32, offset: u32) -> Result<Vec<Collector>, sqlx::Error> {
    search = util::escape_for_like(search);

    let collectors = sqlx::query_as(
        "SELECT coid as id,
                coname as name,
                codescription as description,
                uid as userId
         FROM collectors
         WHERE coname LIKE CONCAT('%', ?, '%')
         LIMIT ? OFFSET ?;")
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
