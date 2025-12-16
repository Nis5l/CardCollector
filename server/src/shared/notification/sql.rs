use super::data::NotificationCreateData;
use crate::sql::Sql;
use crate::shared::Id;

pub async fn add_notification(sql: &Sql, user_id: &Id, collector_id: Option<&Id>, notification_create: &NotificationCreateData) -> Result<(), sqlx::Error> {
    //TODO: if already exists

    sqlx::query(
        "INSERT INTO notifications
         (uid, coid, ntitle, nmessage, nurl, ntime)
         VALUES
         (?, ?, ?, ?, ?, ?);")
        .bind(user_id)
        .bind(collector_id)
        .bind(&notification_create.title)
        .bind(&notification_create.message)
        .bind(&notification_create.url)
        .bind(&notification_create.time)
        .execute(sql.pool())
        .await?;

    Ok(())
}
