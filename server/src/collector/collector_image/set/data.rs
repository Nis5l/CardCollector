use serde::Serialize;
use rocket::fs::TempFile;
use rocket::form::FromForm;

#[derive(FromForm)]
pub struct CollectorImageSetRequest<'r> {
    pub file: TempFile<'r>,
}

#[derive(Serialize)]
pub struct CollectorImageSetResponse {
    pub message: String,
}
