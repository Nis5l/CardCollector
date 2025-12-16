use chrono::{DateTime, Utc};

use crate::sql::Sql;
use crate::shared::Id;

pub async fn last_trade_time(sql: &Sql, trade_id: &Id) -> Result<Option<DateTime<Utc>>, sqlx::Error> {
    let (last_trade_time,): (Option<DateTime<Utc>>,) = sqlx::query_as(
        "SELECT tlasttrade
         FROM trades
         WHERE tid=?;")
        .bind(trade_id)
        .fetch_one(sql.pool())
        .await?;

    Ok(last_trade_time)
}
