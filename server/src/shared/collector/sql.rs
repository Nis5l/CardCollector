use crate::sql::Sql;
use crate::shared::Id;
use super::data::CollectorSetting;

pub async fn collector_exists(sql: &Sql, collector_id: &Id) -> Result<bool, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let (count, ): (i32, ) = sqlx::query_as(
        "SELECT COUNT(*)
         FROM collectors
         WHERE coid=?;")
        .bind(collector_id)
        .fetch_one(&mut con)
        .await?;

    Ok(count != 0)
}

pub async fn collecor_is_admin(sql: &Sql, collector_id: &Id, user_id: &Id) -> Result<bool, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let (count, ): (i32, ) = sqlx::query_as(
        "SELECT COUNT(*)
         FROM collectors
         WHERE coid=?
         AND uid=?;")
        .bind(collector_id)
        .bind(user_id)
        .fetch_one(&mut con)
        .await?;

    Ok(count != 0)
}

pub async fn get_collector_setting<T>(sql: &Sql, collector_id: &Id, setting: CollectorSetting, pack_cooldown_fallback: T) -> Result<T, sqlx::Error>
    where T: std::str::FromStr {
    let mut con = sql.get_con().await?;

    let pack_cooldown: Result<(String, ), sqlx::Error> = sqlx::query_as(
        "SELECT cosvalue
         FROM collectorsettings
         WHERE coid=?
         AND coskey=?;")
        .bind(collector_id)
        .bind(setting.to_string())
        .fetch_one(&mut con)
        .await;

    let pack_cooldown = match pack_cooldown {
        Err(sqlx::Error::RowNotFound) => pack_cooldown_fallback,
        Ok((pack_cooldown, )) => {
            pack_cooldown.parse::<T>().unwrap_or(pack_cooldown_fallback)
        },
        Err(err) => { return Err(err); }
    };

    Ok(pack_cooldown)
}
