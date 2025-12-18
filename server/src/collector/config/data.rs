use serde::Serialize;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CollectorConfigResponse {
    pub name: FieldRange,
    pub description: FieldRange,
    pub moderator_limit: u32
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FieldRange {
    pub min_length: u32,
    pub max_length: u32,
}
