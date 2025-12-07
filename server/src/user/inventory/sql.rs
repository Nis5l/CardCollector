use crate::shared::Id;
use crate::sql::Sql;

pub async fn get_trade_uuids(sql: &Sql, user_id: &Id, friend_id: &Id, suggestions: bool) -> Result<Vec<Id>, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let query = format!(
        "SELECT cuid
         FROM tradecards
         WHERE uidone=? AND uidtwo=?
         {};",
         if suggestions {
             "UNION
              SELECT tradesuggestions.cuid
              FROM tradesuggestions
              WHERE tradesuggestions.uidone=? AND
              tradesuggestions.uidtwo=?"
         } else { "" });

    let mut stmt = sqlx::query_as(&query)
        .bind(user_id)
        .bind(friend_id);

    if suggestions {
        stmt = stmt
        .bind(friend_id)
        .bind(user_id);
    }

    let ids: Vec<(Id, )> = stmt.fetch_all(&mut con).await?;

    Ok(ids.iter().map(|i| { i.0.clone() }).collect())
}
