use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct CollectorFavoriteGetResponse {
    pub favorite: bool
}
