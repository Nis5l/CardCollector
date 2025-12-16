use crate::sql::Sql;
use crate::shared::Id;

pub async fn get_user_ranking(sql: &Sql, user_id: Id) -> Result<i32, sqlx::Error> {
    let (rank,): (i32,) = sqlx::query_as(
        "SELECT uranking
         FROM users
         WHERE uid=?;")
        .bind(user_id)
        .fetch_one(sql.pool())
        .await?;

    Ok(rank)
}
