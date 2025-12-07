use sqlx::mysql::MySqlQueryResult;

use crate::sql::Sql;
use crate::shared::Id;

pub async fn accept_friend_request(sql: &Sql, user_id: &Id, user_id_accept: &Id) -> Result<bool, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let result: MySqlQueryResult = sqlx::query(
        "UPDATE friends
         SET frstatus=1
         WHERE uidtwo=? AND uidone=? AND frstatus=0;")
        .bind(user_id)
        .bind(user_id_accept)
        .execute(&mut con)
        .await?;

    Ok(result.rows_affected() != 0)
}
