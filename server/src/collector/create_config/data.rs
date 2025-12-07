use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct CollectorCreateConfigResponse {
    pub min_length: u32,
    pub max_length: u32
}


