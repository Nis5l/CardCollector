use crate::sql::Sql;
use crate::shared::Id;
use crate::shared::card::data::CardVote;

pub async fn vote(sql: &Sql, user_id: &Id, card_id: &Id, vote: CardVote) -> Result<(), sqlx::Error> {
    sqlx::query("INSERT INTO cardvotes (uid, cid, cvtype)
                 VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                 cvtype = VALUES(cvtype);")
        .bind(user_id)
        .bind(card_id)
        .bind(vote as i32)
        .execute(sql.pool())
        .await?;

    Ok(())
}

pub async fn vote_delete(sql: &Sql, user_id: &Id, delete_card_id: &Id, vote: CardVote) -> Result<(), sqlx::Error> {
    sqlx::query("INSERT INTO deletecardvotes (uid, dcid, dcvtype)
                 VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                 dcvtype = VALUES(dcvtype);")
        .bind(user_id)
        .bind(delete_card_id)
        .bind(vote as i32)
        .execute(sql.pool())
        .await?;

    Ok(())
}
