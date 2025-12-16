use crate::sql::Sql;
use crate::shared::Id;

pub async fn collector_exists(sql: &Sql, collector_name: &str) -> Result<bool, sqlx::Error> {
    let (count, ): (i32, ) = sqlx::query_as(
        "SELECT COUNT(*)
         FROM collectors
         WHERE coname=?;")
        .bind(collector_name)
        .fetch_one(sql.pool())
        .await?;

    Ok(count != 0)
}

pub async fn create_collector(sql: &Sql, collector_name: &str, collector_description: &str, collector_id: &Id, user_id: &Id) -> Result<(), sqlx::Error> {
    sqlx::query(
        "INSERT INTO collectors
         (coid, uid, coname, codescription)
         VALUES
         (?, ?, ?, ?);")
        .bind(collector_id)
        .bind(user_id)
        .bind(collector_name)
        .bind(collector_description)
        .execute(sql.pool())
        .await?;

    Ok(())
}
