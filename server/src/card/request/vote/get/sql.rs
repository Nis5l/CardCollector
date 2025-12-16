use crate::sql::Sql;
use crate::shared::Id;

use crate::shared::card::data::CardVote;

pub async fn get_votes(sql: &Sql, card_id: &Id) -> Result<i32, sqlx::Error> {
    let (count, ): (i32, ) = sqlx::query_as(
        "SELECT 
         CAST(COALESCE(SUM(cvtype), 0) AS SIGNED)
         FROM cardvotes
         WHERE cid = ?;")
        .bind(card_id)
        .fetch_one(sql.pool())
        .await?;

    Ok(count)
}

pub async fn get_vote(sql: &Sql, card_id: &Id, user_id: &Id) -> Result<CardVote, sqlx::Error> {
    let stmt: Result<(i32, ), sqlx::Error> = sqlx::query_as(
        "SELECT cvtype
         FROM cardvotes
         WHERE cid = ?
         AND uid = ?;")
        .bind(card_id)
        .bind(user_id)
        .fetch_one(sql.pool())
        .await;

    if let Err(sqlx::Error::RowNotFound) = stmt {
        return Ok(CardVote::Neutral);
    }

    let (vote, ): (i32, ) = stmt?;

    Ok(CardVote::from_db(vote))
}
