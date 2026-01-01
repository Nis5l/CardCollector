use serde::Serialize;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CollectorConfigResponse {
    pub pack_cooldown: u32,
    pub pack_amount: u32,
    pub pack_quality_min: i32,
    pub pack_quality_max: i32
}
