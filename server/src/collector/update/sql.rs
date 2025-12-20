use crate::sql::Sql;
use crate::shared::Id;

pub async fn update_collector(sql: &Sql, collector_name: &str, collector_description: &str, collector_id: &Id) -> Result<(), sqlx::Error> {
    sqlx::query(
        "UPDATE collectors
         SET coname = ?, codescription = ?
         WHERE coid = ?;")
        .bind(collector_name)
        .bind(collector_description)
        .bind(collector_id)
        .execute(sql.pool())
        .await?;

    Ok(())
}
