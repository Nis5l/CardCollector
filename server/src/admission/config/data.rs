use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct AdmissionConfigResponse {
    pub username: AdmissionConfigFieldRange,
    pub password: AdmissionConfigFieldRange,
}

#[derive(Debug, Serialize)]
#[serde(rename_all="camelCase")]
pub struct AdmissionConfigFieldRange {
    pub min_length: u32,
    pub max_length: u32,
}
