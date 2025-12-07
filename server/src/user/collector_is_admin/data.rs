use serde::Serialize;

#[derive(Debug, Serialize)]
#[serde(rename_all="camelCase")]
pub struct CollectorIsAdminResponse {
    pub is_admin: bool
}
