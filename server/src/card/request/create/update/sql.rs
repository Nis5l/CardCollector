use crate::sql::Sql;
use crate::shared::Id;
use crate::shared::card::data::CardState;

pub async fn create_card_update_request(sql: &Sql, card_id: &Id, name: &str, card_type: &Id, user_id: &Id, card_id_reference: &Id) -> Result<(), sqlx::Error> {
    sqlx::query("INSERT INTO cards
                 (cid, cname, ctid, uid, cstate, cupdatectid)
                 VALUES (?, ?, ?, ?, ?, ?);")
        .bind(card_id)
        .bind(name)
        .bind(card_type)
        .bind(user_id)
        .bind(CardState::Requested as i32)
        .bind(card_id_reference)
        .execute(sql.pool())
        .await?;

    Ok(())
}
