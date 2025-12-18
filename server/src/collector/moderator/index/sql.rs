use crate::sql::Sql;
use crate::shared::Id;
use crate::shared::user::data::{UserDb, User};

pub async fn get_collector_moderators(sql: &Sql, collector_id: &Id) -> Result<Vec<User>, sqlx::Error> {

    let moderators_db: Vec<UserDb> = sqlx::query_as(
        "SELECT users.uid, users.uusername, users.uranking, users.utime
         FROM collectormoderators, users
         WHERE users.uid = collectormoderators.uid
         AND coid=?;")
        .bind(collector_id)
        .fetch_all(sql.pool())
        .await?;

    let moderators = moderators_db.into_iter().map(User::from).collect();

    Ok(moderators)
}
