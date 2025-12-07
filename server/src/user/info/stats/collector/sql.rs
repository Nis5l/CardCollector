use crate::sql::Sql;
use crate::shared::Id;

pub async fn get_user_card_count(sql: &Sql, user_id: &Id, collector_id: &Id) -> Result<i64, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let (count, ): (i64, ) = sqlx::query_as(
        "SELECT COUNT(DISTINCT cid)
         FROM cardunlocks, cards
         WHERE uid=?
         AND cardunlocks.cid = cards.cid
         AND cards.coid=?;")
        .bind(user_id)
        .bind(collector_id)
        .fetch_one(&mut con)
        .await?;

    Ok(count)
}

pub async fn get_max_card_count(sql: &Sql, collector_id: &Id) -> Result<i64, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let (count, ): (i64, ) = sqlx::query_as(
        "SELECT COUNT(*)
         FROM cards
         WHERE coid=?;")
        .bind(collector_id)
        .fetch_one(&mut con)
        .await?;

    Ok(count)
}

pub async fn get_trades_on_cooldown_count(sql: &Sql, user_id: &Id, collector_id: &Id, cooldown: u32) -> Result<i64, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let (count, ): (i64, ) = sqlx::query_as(
        "SELECT COUNT(*)
         FROM trades
         WHERE (uidone = ? OR uidtwo = ?)
         AND DATE_ADD(tlasttrade, INTERVAL ? SECOND) < NOW()
         AND coid=?;")
        .bind(user_id)
        .bind(user_id)
        .bind(cooldown)
        .bind(collector_id)
        .fetch_one(&mut con)
        .await?;

    Ok(count)
}
