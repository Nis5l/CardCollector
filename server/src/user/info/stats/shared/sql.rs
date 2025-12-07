use crate::sql::Sql;
use crate::shared::Id;
use super::data::Achievement;

pub async fn get_achievements(sql: &Sql, user_id: &Id, collector_id: Option<&Id>) -> Result<Vec<Achievement>, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let achievements: Vec<Achievement> = sqlx::query_as(
        "SELECT achievements.aimage as image, achievements.atext as text
         FROM achievementunlocks, achievements
         WHERE achievementunlocks.aid = achievements.aid
         AND achievementunlocks.uid = ?
         AND achievements.coid=?;")
        .bind(user_id)
        .bind(collector_id)
        .fetch_all(&mut con)
        .await?;

    Ok(achievements)
}
