use lettre::transport::smtp::authentication::Credentials;
use lettre::{Message, SmtpTransport, Transport};
use lettre::transport::smtp::response::Response;
use lettre::transport::smtp::Error;

pub async fn send_email(from: &str, password: &str, to: &str, key: &str, domain: &str, smtp_server: &str, username: &str) -> Result<Response, Error> {
    let email = Message::builder()
        .from(format!("CardCollector <{}>", from).parse().unwrap())
        .to(format!("{} <{}>", username, to).parse().unwrap())
        .subject("CardCollector verify")
        .body(format!("{}/verify?key={}", domain, key))
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

pub fn send_email_async(from: String, password: String, to: String, key: String, domain: String, smtp_server: String, username: String) {
    tokio::spawn(async move {
        if let Err(err) = send_email(&from, &password, &to, &key, &domain, &smtp_server, &username).await {
            println!("Error sending mail to {} {}, {}", username, to, err);
        };
    });
}
