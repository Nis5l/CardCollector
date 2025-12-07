use serde::Serialize;
use rocket::fs::TempFile;
use rocket::form::FromForm;

#[derive(FromForm)]
pub struct CardImageSetRequest<'r> {
    pub file: TempFile<'r>,
}

#[derive(Serialize)]
pub struct CardImageSetResponse {
    pub message: String,
}
