use crate::sql::Sql;

pub async fn delete_refresh_token(sql: &Sql, refresh_token: &str) -> Result<u64, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let result = sqlx::query("DELETE FROM refreshtokens WHERE rtoken = ? ;")
        .bind(refresh_token)
        .execute(&mut con)
        .await?;

    Ok(result.rows_affected())
}
