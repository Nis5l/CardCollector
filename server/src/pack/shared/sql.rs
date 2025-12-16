use chrono::{DateTime, Utc};

use crate::sql::Sql;
use crate::shared::Id;

pub async fn get_pack_time(sql: &Sql, user_id: &Id, collector_id: &Id) -> Result<Option<DateTime<Utc>>, sqlx::Error> {
    let stmt = sqlx::query_as(
        "SELECT ptlastopened
         FROM packtimes
         WHERE uid=?
         AND coid=?;")
        .bind(user_id)
        .bind(collector_id)
        .fetch_one(sql.pool())
        .await;

    if let Err(sqlx::Error::RowNotFound) = stmt {
        return Ok(None);
    }

    let (time, ): (Option<DateTime<Utc>>, ) = stmt?;

    Ok(time)
}
