use sqlx::Row;

use crate::sql::Sql;
use crate::shared::Id;

pub async fn is_favorite(sql: &Sql, user_id: &Id, collector_id: &Id) -> Result<bool, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let found_rows = sqlx::query(
        "SELECT COUNT(*) FROM collectorfavorites
         WHERE coid = ? AND uid = ?")
        .bind(collector_id)
        .bind(user_id)
        .fetch_one(&mut con)
        .await?;

    let count: i8 = found_rows.get(0);

    Ok(count == 1)
}
