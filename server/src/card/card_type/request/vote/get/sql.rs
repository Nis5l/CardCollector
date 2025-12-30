use crate::sql::Sql;
use crate::shared::Id;

use crate::shared::card::data::CardVote;

pub async fn get_votes(sql: &Sql, card_type_id: &Id) -> Result<i32, sqlx::Error> {
    let (count, ): (i32, ) = sqlx::query_as(
        "SELECT 
         CAST(COALESCE(SUM(ctvtype), 0) AS SIGNED)
         FROM cardtypevotes
         WHERE ctid = ?;")
        .bind(card_type_id)
        .fetch_one(sql.pool())
        .await?;

    Ok(count)
}

pub async fn get_vote(sql: &Sql, card_type_id: &Id, user_id: &Id) -> Result<CardVote, sqlx::Error> {
    let stmt: Result<(i32, ), sqlx::Error> = sqlx::query_as(
        "SELECT ctvtype
         FROM cardtypevotes
         WHERE ctid = ?
         AND uid = ?;")
        .bind(card_type_id)
        .bind(user_id)
        .fetch_one(sql.pool())
        .await;

    if let Err(sqlx::Error::RowNotFound) = stmt {
        return Ok(CardVote::Neutral);
    }

    let (vote, ): (i32, ) = stmt?;

    Ok(CardVote::from(vote))
}

pub async fn get_votes_delete(sql: &Sql, delete_card_type_id: &Id) -> Result<i32, sqlx::Error> {
    let (count, ): (i32, ) = sqlx::query_as(
        "SELECT 
         CAST(COALESCE(SUM(dctvtype), 0) AS SIGNED)
         FROM deletecardtypevotes
         WHERE dctid = ?;")
        .bind(delete_card_type_id)
        .fetch_one(sql.pool())
        .await?;

    Ok(count)
}

pub async fn get_vote_delete(sql: &Sql, delete_card_type_id: &Id, user_id: &Id) -> Result<CardVote, sqlx::Error> {
    let stmt: Result<(i32, ), sqlx::Error> = sqlx::query_as(
        "SELECT dctvtype
         FROM deletecardtypevotes
         WHERE dctid = ?
         AND uid = ?;")
        .bind(delete_card_type_id)
        .bind(user_id)
        .fetch_one(sql.pool())
        .await;

    if let Err(sqlx::Error::RowNotFound) = stmt {
        return Ok(CardVote::Neutral);
    }

    let (vote, ): (i32, ) = stmt?;

    Ok(CardVote::from(vote))
}
