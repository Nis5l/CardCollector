use crate::sql::Sql;
use crate::shared::Id;
use crate::shared::card::data::CardState;

pub async fn card_exists(sql: &Sql, name: &str, card_type: &Id, user_id: &Id) -> Result<bool, sqlx::Error> {
    let (count, ): (i32, ) = sqlx::query_as(
        "SELECT COUNT(*)
         FROM cards
         WHERE cname=? AND
         ctid=? AND
         (uid=? OR cstate=?);")
        .bind(name)
        .bind(card_type)
        .bind(user_id)
        .bind(CardState::Created as i32)
        .fetch_one(sql.pool())
        .await?;

    Ok(count != 0)
}

pub async fn create_card_request(sql: &Sql, card_id: &Id, name: &str, card_type: &Id, user_id: &Id) -> Result<(), sqlx::Error> {
    sqlx::query("INSERT INTO cards
                 (cid, cname, ctid, uid, cstate)
                 VALUES (?, ?, ?, ?, ?);")
        .bind(card_id)
        .bind(name)
        .bind(card_type)
        .bind(user_id)
        .bind(CardState::Requested as i32)
        .execute(sql.pool())
        .await?;

    Ok(())
}
