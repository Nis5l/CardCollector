use super::data::Notification;
use crate::sql::Sql;
use crate::shared::Id;

pub async fn get_notifications(sql: &Sql, user_id: &Id, collector_id: &Option<Id>) -> Result<Vec<Notification>, sqlx::Error> {
    let query = format!(
        "SELECT nid AS id, uid AS userId, ntitle AS title, nmessage AS message, nurl AS url, ntime AS time
         FROM notifications
         WHERE uid = ?
         {};",
         match collector_id {
                None => "",
                Some(_) => "AND coid=?"
        });

    let mut stmt = sqlx::query_as(&query)
        .bind(user_id);

    if let Some(collector_id) = collector_id {
        println!("{:?}", collector_id);
        stmt = stmt.bind(collector_id);
    }

    let notifications: Vec<Notification> = stmt
        .fetch_all(sql.pool())
        .await?;

    Ok(notifications)
}
