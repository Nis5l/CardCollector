use crate::sql::Sql;
use crate::shared::Id;
use crate::shared::collector::Collector;

pub async fn get_favorites(sql: &Sql, user_id: &Id) -> Result<Vec<Collector>, sqlx::Error> {
    let collectors: Vec<Collector> = sqlx::query_as(
        "SELECT
         collectors.coid as id,
         collectors.uid as userId,
         collectors.coname as name,
         collectors.codescription as description
         FROM collectorfavorites, collectors
         WHERE collectors.coid = collectorfavorites.coid
         AND collectorfavorites.uid = ?;")
        .bind(user_id)
        .fetch_all(sql.pool())
        .await?;

    Ok(collectors)
}
