use serde::{Serialize};

#[derive(Debug, Serialize)]
pub struct LogoutResponse {
    pub message: String
}