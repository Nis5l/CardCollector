use serde::Serialize;

#[derive(Debug, Serialize)]
#[serde(rename_all="camelCase")]
pub struct CardConfigResponse {
    pub name_length_min: u32,
    pub name_length_max: u32
}
