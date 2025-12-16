use crate::sql::Sql;
use crate::shared::Id;
use crate::shared::card::data::CardState;

pub async fn can_set_card_image(sql: &Sql, card_id: &Id, user_id: &Id) -> Result<bool, sqlx::Error> {
    let (count, ): (i64, ) = sqlx::query_as(
        "SELECT COUNT(*)
         FROM cards
         WHERE cid=?
         AND uid=?
         AND cstate=?;")
        .bind(card_id)
        .bind(user_id)
        .bind(CardState::Requested as i64)
        .fetch_one(sql.pool())
        .await?;

    Ok(count != 0)
}
