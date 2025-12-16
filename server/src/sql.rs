use sqlx::{Pool, MySql};
use std::fs;

#[derive(Debug, Clone)]
pub struct Sql(pub Pool<MySql>);

impl Sql {
    pub fn pool(&self) -> &Pool<MySql> {
        &self.0
    }
}

//TODO: find a better solution
pub async fn setup_db(sql: &Sql, file: &str) -> Result<(), sqlx::Error> {

    let file_sql = fs::read_to_string(file)
        .expect("Failed reading file");

    let queries = file_sql.split(";");

    for query in queries {
        let prepared_query = String::from(query.trim()) + ";";
        if prepared_query.len() == 1 { continue; }

        let result = sqlx::query(&prepared_query)
            .execute(sql.pool())
            .await;

        if result.is_ok() {
            println!("{}", prepared_query);
        }
    }

    Ok(())
}
