use chrono::{Duration, DateTime, Utc};
use rocket::{http::{Cookie, SameSite}, time::OffsetDateTime};

pub fn time_from_db(trade_time: Option<DateTime<Utc>>, trade_cooldown: u32) -> DateTime<Utc> {
    match trade_time {
        None => {
            return Utc::now();
        },
        Some(time) => {
            return time + Duration::seconds(trade_cooldown as i64);
        }
    }
}

pub fn escape_for_like(s: String) -> String {
    s.replace("!", "!!")
     .replace("%", "!%")
     .replace("_", "!_")
     .replace("[", "![")
}

pub fn build_refresh_token_cookie(value: String, expires_in: i64) -> Cookie<'static>{
    let expires = OffsetDateTime::now_utc() + rocket::time::Duration::seconds(expires_in);

    let cookie = Cookie::build(("refresh_token", value))
        .path("/")
        .expires(expires)
        .same_site(SameSite::None)
        //TODO: reactivate when https
        //.secure(true)
        .http_only(true);

    cookie.finish()
}
