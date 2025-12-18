use crate::sql::Sql;
use crate::shared::Id;

pub async fn remove_collector_moderator(sql: &Sql, collector_id: &Id, user_id: &Id) -> Result<(), sqlx::Error> {
    sqlx::query(
        "DELETE FROM collectormoderators
         WHERE coid=?
         AND uid=?;")
        .bind(collector_id)
        .bind(user_id)
        .execute(sql.pool())
        .await?;

    Ok(())
}
