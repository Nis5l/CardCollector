use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct CollectorConfigResponse {
    pub name: FieldRange,
    pub description: FieldRange
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FieldRange {
    pub min_length: u32,
    pub max_length: u32,
}
