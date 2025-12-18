use crate::sql::Sql;
use crate::shared::Id;

pub async fn add_collector_moderator(sql: &Sql, collector_id: &Id, user_id: &Id) -> Result<Vec<(Id, String)>, sqlx::Error> {
    let moderators: Vec<(Id, String)> = sqlx::query_as(
        "INSERT INTO collectormoderators
         (coid, uid, cmprivilege)
         VALUES
         (?, ?, 0);") //TODO: 0 is filler for now
        .bind(collector_id)
        .bind(user_id)
        .fetch_all(sql.pool())
        .await?;

    Ok(moderators)
}

pub async fn collector_moderator_count(sql: &Sql, collector_id: &Id) -> Result<i32, sqlx::Error> {
    let (count, ): (i32, ) = sqlx::query_as(
        "SELECT COUNT(*)
         FROM collectormoderators
         WHERE coid=?;")
        .bind(collector_id)
        .fetch_one(sql.pool())
        .await?;

    Ok(count)
}
