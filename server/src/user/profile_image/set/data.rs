use serde::Serialize;
use rocket::fs::TempFile;
use rocket::form::FromForm;

#[derive(FromForm)]
pub struct ProfileImageSetRequest<'r> {
    pub file: TempFile<'r>,
}

#[derive(Serialize)]
pub struct ProfileImageSetResponse {
    pub message: String,
}
