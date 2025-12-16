use crate::sql::Sql;
use crate::shared::Id;

pub async fn is_collector_owner(sql: &Sql, collector_id: &Id, user_id: &Id) -> Result<bool, sqlx::Error> {
    let (count, ): (i32, ) = sqlx::query_as(
        "SELECT COUNT(*)
         FROM collectors
         WHERE coid = ? AND uid = ?;")
        .bind(collector_id)
        .bind(user_id)
        .fetch_one(sql.pool())
        .await?;

    Ok(count != 0)
}

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
