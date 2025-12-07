use serde::Serialize;

use crate::shared::collector::Collector;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CollectorIndexResponse {
    pub page_size: u32,
    pub page: u32,
    pub collector_count: u32,
    pub collectors: Vec<Collector>,
}
