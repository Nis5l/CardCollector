use serde::Serialize;

#[derive(Debug, Serialize)]
#[serde(rename_all="camelCase")]
pub struct CollectorIsOwnerModeratorResponse {
    pub is_owner_moderator: bool
}
