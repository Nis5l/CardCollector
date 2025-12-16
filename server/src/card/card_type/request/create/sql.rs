use crate::sql::Sql;
use crate::shared::Id;
use crate::shared::card::data::CardState;

pub async fn collector_type_request_create(sql: &Sql, card_type_id: &Id, collector_id: &Id, user_id: &Id, name: &str) -> Result<(), sqlx::Error> {
    sqlx::query("INSERT INTO cardtypes
                 (ctid, coid, uid, ctname, ctstate)
                 VALUES
                 (?, ?, ?, ?, ?)")
        .bind(card_type_id)
        .bind(collector_id)
        .bind(user_id)
        .bind(name)
        .bind(CardState::Requested as i32)
        .execute(sql.pool())
        .await?;

    Ok(())
}

pub async fn card_type_requests_user_count(sql: &Sql, user_id: &Id) -> Result<i32, sqlx::Error> {
    let (count, ): (i32, ) = sqlx::query_as(
        "SELECT COUNT(*)
         FROM cardtypes
         WHERE uid=?
         AND ctstate=?;")
        .bind(user_id)
        .bind(CardState::Requested as i32)
        .fetch_one(sql.pool())
        .await?;

    Ok(count)
}

pub async fn collector_type_exists(sql: &Sql, collector_id: &Id, user_id: &Id, name: &str) -> Result<bool, sqlx::Error> {
    let (count, ): (i64, ) = sqlx::query_as(
        "SELECT COUNT(*)
         FROM cardtypes
         WHERE coid=? AND
         ctname=? AND
         (ctstate=? OR uid=?);")
        .bind(collector_id)
        .bind(name)
        .bind(CardState::Created as i32)
        .bind(user_id)
        .fetch_one(sql.pool())
        .await?;


    Ok(count != 0)
}
