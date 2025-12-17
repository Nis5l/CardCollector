use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct ForgotCheckResponse {
    pub message: String
}
