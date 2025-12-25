use crate::sql::Sql;
use crate::shared::Id;
use crate::shared::card::data::{CardState, Card};

pub async fn card_request_accept(sql: &Sql, card_id: &Id) -> Result<(), sqlx::Error> {
    sqlx::query("UPDATE cards
                 SET cstate=?
                 WHERE cid=?
                 AND cstate=?;")
        .bind(CardState::Created as i32)
        .bind(card_id)
        .bind(CardState::Requested as i32)
        .execute(sql.pool())
        .await?;

    Ok(())
}


pub async fn card_request_accept_update(sql: &Sql, card_id: &Id, update_card: &Card) -> Result<(), sqlx::Error> {
    let mut transaction = sql.pool().begin().await?;

    sqlx::query("UPDATE cards
                 SET cname=?, ctid=?
                 WHERE cid=?
                 AND cstate=?;")
        .bind(&update_card.card_info.name)
        .bind(&update_card.card_type.id)
        .bind(&card_id)
        .bind(CardState::Created as i32)
        .execute(&mut *transaction)
        .await?;

    sqlx::query("DELETE FROM cards
                 WHERE cid=?;")
        .bind(&update_card.card_info.id)
        .execute(&mut *transaction)
        .await?;

    transaction.commit().await?;

    Ok(())
}

pub async fn card_delete_request_accept(sql: &Sql, delete_card_id: &Id, card_id: &Id) -> Result<(), sqlx::Error> {
    let mut transaction = sql.pool().begin().await?;

    sqlx::query("DELETE FROM cards
                 WHERE cid=?
                 AND cstate=?;")
        .bind(&card_id)
        .bind(CardState::Created as i32)
        .execute(&mut *transaction)
        .await?;

    sqlx::query("DELETE FROM deletecards
                 WHERE dcid=?;")
        .bind(&delete_card_id)
        .execute(&mut *transaction)
        .await?;

    transaction.commit().await?;

    Ok(())
}
