use serde::Serialize;
use rocket::fs::TempFile;
use rocket::form::FromForm;

#[derive(FromForm)]
pub struct CollectorBannerSetRequest<'r> {
    pub file: TempFile<'r>,
}

#[derive(Serialize)]
pub struct CollectorBannerSetResponse {
    pub message: String,
}
