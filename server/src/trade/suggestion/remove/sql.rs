use sqlx::mysql::MySqlQueryResult;

use crate::sql::Sql;
use crate::shared::Id;

pub async fn remove_suggestion(sql: &Sql, trade_id: &Id, card_unlocked_id: &Id) -> Result<bool, sqlx::Error> {
    let result: MySqlQueryResult = sqlx::query(
        "DELETE FROM tradesuggestions
         WHERE cuid=?
         AND tid=?;")
        .bind(card_unlocked_id)
        .bind(trade_id)
        .execute(sql.pool())
        .await?;

    Ok(result.rows_affected() != 0)
}
