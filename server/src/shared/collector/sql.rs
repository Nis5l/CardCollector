use crate::sql::Sql;
use crate::shared::Id;
use super::data::CollectorSetting;

pub async fn collector_exists(sql: &Sql, collector_id: &Id) -> Result<bool, sqlx::Error> {
    let (count, ): (i32, ) = sqlx::query_as(
        "SELECT COUNT(*)
         FROM collectors
         WHERE coid=?;")
        .bind(collector_id)
        .fetch_one(sql.pool())
        .await?;

    Ok(count != 0)
}

pub async fn collector_is_owner_or_moderator(sql: &Sql, collector_id: &Id, user_id: &Id) -> Result<bool, sqlx::Error> {
    let (count, ): (i32, ) = sqlx::query_as(
        "SELECT
            (SELECT COUNT(*) FROM collectors WHERE coid = ? AND uid = ?) +
            (SELECT COUNT(*) FROM collectormoderators WHERE coid = ? AND uid = ?)
        AS count;")
        .bind(collector_id)
        .bind(user_id)
        .bind(collector_id)
        .bind(user_id)
        .fetch_one(sql.pool())
        .await?;

    Ok(count != 0)
}

pub async fn collector_is_owner(sql: &Sql, collector_id: &Id, user_id: &Id) -> Result<bool, sqlx::Error> {
    let (count, ): (i32, ) = sqlx::query_as(
        "SELECT COUNT(*)
         FROM collectors
         WHERE coid = ?
         AND uid = ?;")
        .bind(collector_id)
        .bind(user_id)
        .fetch_one(sql.pool())
        .await?;

    Ok(count != 0)
}

pub async fn collector_is_moderator(sql: &Sql, collector_id: &Id, user_id: &Id) -> Result<bool, sqlx::Error> {
    let (count, ): (i32, ) = sqlx::query_as(
        "SELECT COUNT(*)
         FROM collectormoderators
         WHERE coid = ?
         AND uid = ?;")
        .bind(collector_id)
        .bind(user_id)
        .fetch_one(sql.pool())
        .await?;

    Ok(count != 0)
}

pub async fn get_collector_setting<T>(sql: &Sql, collector_id: &Id, setting: CollectorSetting, fallback: T) -> Result<T, sqlx::Error>
    where T: std::str::FromStr {

    let value: Result<(String, ), sqlx::Error> = sqlx::query_as(
        "SELECT cosvalue
         FROM collectorsettings
         WHERE coid=?
         AND coskey=?;")
        .bind(collector_id)
        .bind(setting.to_string())
        .fetch_one(sql.pool())
        .await;

    let pack_cooldown = match value {
        Err(sqlx::Error::RowNotFound) => fallback,
        Ok((pack_cooldown, )) => {
            pack_cooldown.parse::<T>().unwrap_or(fallback)
        },
        Err(err) => { return Err(err); }
    };

    Ok(pack_cooldown)
}

pub async fn set_collector_image(sql: &Sql, collector_id: &Id, image_hash: &str) -> Result<(), sqlx::Error> {
    sqlx::query(
        "UPDATE collectors
         SET coimage=?
         WHERE coid=?;")
        .bind(image_hash)
        .bind(collector_id)
        .execute(sql.pool())
        .await?;

    Ok(())
}

pub async fn get_collector_image(sql: &Sql, collector_id: &Id) -> Result<Option<String>, sqlx::Error> {
    let stmt: Result<(Option<String>,), sqlx::Error> = sqlx::query_as(
        "SELECT coimage
         FROM collectors
         WHERE coid=?;")
        .bind(collector_id)
        .fetch_one(sql.pool())
        .await;

    if let Err(sqlx::Error::RowNotFound) = stmt {
        return Ok(None)
    }

    Ok(stmt?.0)
}

pub async fn set_collector_banner(sql: &Sql, collector_id: &Id, banner_hash: &str) -> Result<(), sqlx::Error> {
    sqlx::query(
        "UPDATE collectors
         SET cobanner=?
         WHERE coid=?;")
        .bind(banner_hash)
        .bind(collector_id)
        .execute(sql.pool())
        .await?;

    Ok(())
}

pub async fn get_collector_banner(sql: &Sql, collector_id: &Id) -> Result<Option<String>, sqlx::Error> {
    let stmt: Result<(Option<String>,), sqlx::Error> = sqlx::query_as(
        "SELECT cobanner
         FROM collectors
         WHERE coid=?;")
        .bind(collector_id)
        .fetch_one(sql.pool())
        .await;

    if let Err(sqlx::Error::RowNotFound) = stmt {
        return Ok(None)
    }

    Ok(stmt?.0)
}
