use crate::sql::Sql;
use crate::shared::{Id, collector::CollectorSetting};

pub async fn set_collector_setting(sql: &Sql, collector_id: &Id, setting: CollectorSetting, value: &str) -> Result<(), sqlx::Error> {
    sqlx::query(
        "INSERT INTO collectorsettings
         (coid, coskey, cosvalue)
         VALUES
         (?, ?, ?)
         ON DUPLICATE KEY UPDATE
         cosvalue = VALUES(cosvalue);")
        .bind(collector_id)
        .bind(setting.to_string())
        .bind(value)
        .execute(sql.pool())
        .await?;

    Ok(())
}
