use crate::sql::Sql;
use crate::shared::Id;
use crate::shared::card::data::CardVote;

pub async fn vote(sql: &Sql, user_id: &Id, card_type_id: &Id, vote: CardVote) -> Result<(), sqlx::Error> {
    sqlx::query("INSERT INTO cardtypevotes (uid, ctid, ctvtype)
                 VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                 ctvtype = VALUES(ctvtype);")
        .bind(user_id)
        .bind(card_type_id)
        .bind(vote as i32)
        .execute(sql.pool())
        .await?;

    Ok(())
}

pub async fn vote_delete(sql: &Sql, user_id: &Id, delete_card_type_id: &Id, vote: CardVote) -> Result<(), sqlx::Error> {
    sqlx::query("INSERT INTO deletecardtypevotes (uid, dctid, dctvtype)
                 VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                 dctvtype = VALUES(dctvtype);")
        .bind(user_id)
        .bind(delete_card_type_id)
        .bind(vote as i32)
        .execute(sql.pool())
        .await?;

    Ok(())
}
