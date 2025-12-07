use crate::sql::Sql;
use crate::shared::Id;
use crate::shared::card::data::CardState;

pub async fn card_type_request_accept(sql: &Sql, card_type_id: &Id) -> Result<(), sqlx::Error> {
    let mut con = sql.get_con().await?;

    sqlx::query("UPDATE cardtypes
                 SET ctstate=?
                 WHERE ctid=?
                 AND ctstate=?;")
        .bind(CardState::Created as i32)
        .bind(card_type_id)
        .bind(CardState::Requested as i32)
        .execute(&mut con)
        .await?;

    Ok(())
}

pub async fn card_type_remove_duplicates(sql: &Sql, collector_id: &Id, card_type_id: &Id) -> Result<(), sqlx::Error> {
    let mut con = sql.get_con().await?;

    sqlx::query(
        "DELETE FROM cardtypes
         WHERE coid = ? AND
         ctid <> ? AND
         ctname IN(
             SELECT ctname
             FROM cardtypes
             WHERE ctid = ?
         );")
        .bind(collector_id)
        .bind(card_type_id)
        .bind(card_type_id)
        .execute(&mut con)
        .await?;

    Ok(())
}
