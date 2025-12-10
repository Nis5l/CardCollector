use crate::sql::Sql;
use crate::shared::{Id, collector::Collector};

pub async fn get_favorite_collectors(sql: &Sql, user_id: &Id) -> Result<Vec<Collector>, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let collectors: Vec<Collector> = sqlx::query_as(
        "SELECT
            coid AS id,
            coname AS name,
            codescription AS description
         FROM collectors, collectorfavorites
         WHERE collectors.coid=collectorfavorites.coid
         AND collectorfavorites.uid=?;")
        .bind(user_id)
        .fetch_all(&mut con)
        .await?;

    Ok(collectors)
}
