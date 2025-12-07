use crate::sql::Sql;
use crate::shared::Id;
use crate::shared::collector::Collector;

pub async fn get_favorites(sql: &Sql, user_id: &Id) -> Result<Vec<Collector>, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let collectors: Vec<Collector> = sqlx::query_as(
        "SELECT
         collectors.coid as id,
         collectors.uid as userId,
         collectors.coname as name
         FROM collectorfavorites, collectors
         WHERE collectors.coid = collectorfavorites.coid
         AND collectorfavorites.uid = ?;")
        .bind(user_id)
        .fetch_all(&mut con)
        .await?;

    Ok(collectors)
}
