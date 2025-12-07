use serde::Serialize;
use sqlx::FromRow;

#[derive(Debug, Serialize, FromRow)]
pub struct Achievement {
    pub image: String,
    pub text: String
}
