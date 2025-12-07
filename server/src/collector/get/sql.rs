use crate::{shared::collector::Collector, sql::Sql};
use crate::shared::Id;

pub async fn get_collector(sql: &Sql, collector_id: &Id) -> Result<Option<Collector>, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let stmt: Result<Collector, sqlx::Error> = sqlx::query_as(
        "SELECT coid as id,
                coname as name,
                uid as userId
         FROM collectors
         WHERE coid = ?;")
        .bind(collector_id)
        .fetch_one(&mut con)
        .await;

    if let Err(sqlx::Error::RowNotFound) = stmt {
        return Ok(None);
    }

    Ok(Some(stmt?))
}
