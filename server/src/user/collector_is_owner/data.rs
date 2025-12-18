use serde::Serialize;

#[derive(Debug, Serialize)]
#[serde(rename_all="camelCase")]
pub struct CollectorIsOwnerResponse {
    pub is_owner: bool
}
