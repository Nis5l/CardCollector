use serde::Serialize;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CollectorConfigResponse {
    pub name: FieldRange,
    pub description: FieldRange,
    pub moderator_limit: u32,
    pub pack_cooldown: FieldRange,
    pub pack_amount: FieldRange,
    pub pack_quality_min: FieldRange,
    pub pack_quality_max: FieldRange,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FieldRange {
    pub min: i32,
    pub max: i32,
}
