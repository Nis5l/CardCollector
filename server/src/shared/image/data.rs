use rocket::http::ContentType;
use rocket::fs::NamedFile;
use rocketjson::error::{ApiErrors, self};

#[derive(Debug)]
pub struct ImageResponse {
    pub response: Result<NamedFile, ApiErrors>,
    pub status: Option<rocket::http::Status>
}

impl ImageResponse {
    pub fn ok(status: rocket::http::Status, image: NamedFile) -> Self {
        Self {
            response: Ok(image),
            status: Some(status)
        }
    }
    pub fn api_err(status: rocket::http::Status, error: String) -> Self {
        Self {
            status: Some(status),
            response: Err(error::ApiErrors::ApiError(error::ApiError::new(status, error)))
        }
    }
    pub fn get_status(&self) -> rocket::http::Status {
        if self.status.is_none() {
            return rocket::http::Status::InternalServerError
        }

        return self.status.unwrap();
    }
}

impl<'r> rocket::response::Responder<'r, 'static> for ImageResponse {
    fn respond_to(self, req: &'r rocket::request::Request<'_>) -> rocket::response::Result<'static> {
        let status = self.get_status();

        let content_type = match self.response {
            Ok(_) => ContentType::new("image", "jpeg"),
            Err(_) => ContentType::JSON
        };

        rocket::response::Response::build_from(self.response.respond_to(req).unwrap())
            .status(status)
            .header(content_type)
            .ok()
    }
}
