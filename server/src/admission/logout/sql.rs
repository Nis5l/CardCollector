use crate::sql::Sql;

pub async fn delete_refresh_token(sql: &Sql, refresh_token: &str) -> Result<u64, sqlx::Error> {
    let result = sqlx::query("DELETE FROM refreshtokens WHERE rtoken = ? ;")
        .bind(refresh_token)
        .execute(sql.pool())
        .await?;

    Ok(result.rows_affected())
}
