use sqlx::mysql::MySqlQueryResult;


use crate::sql::Sql;
use crate::shared::Id;

pub async fn delete_all_notifications(sql: &Sql, user_id: &Id, collector_id: &Option<Id>) -> Result<u64, sqlx::Error> {
    let mut con = sql.get_con().await?;
    let sql = format!("DELETE FROM notifications WHERE uid = ? {};",match collector_id{ 
        None => "",
        Some(_collector_id) => "AND coid = ?"
    });


    let mut stmt = sqlx::query(&sql).bind(user_id);

    if let Some(collector_id) = collector_id{
       stmt = stmt.bind(collector_id);  
    }

    let result: MySqlQueryResult = stmt.execute(&mut con).await?;

    Ok(result.rows_affected())
}
