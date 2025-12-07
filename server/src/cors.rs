use rocket::fairing::{Fairing, Info, Kind};
use rocket::http::{Header, Method, Status};
use rocket::{Request, Response};

pub struct CORS;

#[rocket::async_trait] impl Fairing for CORS {
    fn info(&self) -> Info {
        Info {
            name: "Add CORS headers to responses",
            kind: Kind::Response,
        }
    }

    async fn on_response<'r>(&self, request: &'r Request<'_>, response: &mut Response<'r>) {
        if request.method() == Method::Options {
            response.set_status(Status::NoContent);
            response.set_header(Header::new(
                "Access-Control-Allow-Methods",
                "POST, PUT, GET, DELETE",
            ));
            response.set_header(Header::new(
                "Access-Control-Allow-Headers",
                "content-type, authorization",
            ));
        }

        let allowed_origins: Vec<String> = vec![
            //String::from("localhost:4200")
        ];

        let origin = match request.headers().get_one("origin") {
            Some(origin)=>origin,
            None => ""
        };

        //TODO: FILL LIST WITH ALLOWED ORIGINS
        if allowed_origins.contains(&String::from(origin)) || true {
            response.set_header(Header::new("Access-Control-Allow-Origin", origin));
            response.set_header(Header::new("Access-Control-Allow-Credentials", "true"));
            response.set_header(Header::new("Vary", "Origin"));
        }
    }
}
