use lettre::transport::smtp::authentication::Credentials;
use lettre::{Message, SmtpTransport, Transport};
use lettre::transport::smtp::response::Response;
use lettre::transport::smtp::Error;

pub async fn send_email(from: &str, password: &str, to: &str, smtp_server: &str, username: &str, subject: &str, body: String) -> Result<Response, Error> {
    let email = Message::builder()
        .from(format!("CardCollector <{}>", from).parse().unwrap())
        .to(format!("{} <{}>", username, to).parse().unwrap())
        .subject(subject)
        .body(body)
        .unwrap();

    let creds = Credentials::new(String::from(from), String::from(password));

    // Open a remote connection to gmail
    let mailer = SmtpTransport::relay(smtp_server)
        .unwrap()
        .credentials(creds)
        .build();

    // Send the email
    mailer.send(&email)
}

pub fn send_email_async(from: String, password: String, to: String, smtp_server: String, username: String, subject: String, body: String) {
    tokio::spawn(async move {
        if let Err(err) = send_email(&from, &password, &to, &smtp_server, &username, &subject, body).await {
            println!("Error sending mail to {} {}, {}", username, to, err);
        };
    });
}

pub fn send_verify_email_async(from: String, password: String, to: String, key: String, domain: String, smtp_server: String, username: String) {
    send_email_async(from, password, to, smtp_server, username, String::from("CardCollector verify"), format!("{}/verify/{}", domain, key));
}

pub fn send_forgot_email_async(from: String, password: String, to: String, key: String, domain: String, smtp_server: String, username: String) {
    send_email_async(from, password, to, smtp_server, username, String::from("CardCollector pasword reset"), format!("{}/forgot/{}", domain, key));
}
