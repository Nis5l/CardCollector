use crate::sql::Sql;
use crate::shared::Id;

pub async fn add_favorite(sql: &Sql, user_id: &Id, collector_id: &Id) -> Result<(), sqlx::Error> {
    sqlx::query(
        "INSERT INTO collectorfavorites
         (coid, uid)
         VALUES
         (?, ?);")
        .bind(collector_id)
        .bind(user_id)
        .execute(sql.pool())
        .await?;

    Ok(())
}
