use sqlx::mysql::MySqlQueryResult;

use crate::sql::Sql;
use crate::shared::Id;

pub async fn remove_friend(sql: &Sql, user_id: &Id, user_id_remove: &Id) -> Result<bool, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let result: MySqlQueryResult = sqlx::query(
        "DELETE FROM friends
         WHERE (uidone=? AND uidtwo=?) OR (uidtwo=? AND uidone=?)")
        .bind(user_id)
        .bind(user_id_remove)
        .bind(user_id)
        .bind(user_id_remove)
        .execute(&mut con)
        .await?;

    Ok(result.rows_affected() != 0)
}
