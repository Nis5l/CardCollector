use figment::{Figment, providers::{Format, Json, Serialized}};

#[derive(Debug, serde::Deserialize, serde::Serialize)]
pub struct Config {
    port: i32,
    address: String,

    pub jwt_secret: String,
    //seconds
    pub jwt_duration: u32,
    pub refresh_token_secret: String,
    pub refresh_token_duration: u32,

    pub refresh_token_rotation_strategy: bool,

    pub domain: String,
    pub verification_key_length: usize,
    pub verification_key_resend_cooldown: u32,
    pub id_length: usize,

    pub username_len_min: u32,
    pub username_len_max: u32,

    pub collector_len_min: u32,
    pub collector_len_max: u32,
    pub collector_desciption_len_min: u32,
    pub collector_desciption_len_max: u32,

    pub card_type_len_min: u32,
    pub card_type_len_max: u32,

    pub card_name_len_min: u32,
    pub card_name_len_max: u32,

    pub password_len_min: u32,
    pub password_len_max: u32,

    pub users_page_amount: u32,
    pub collectors_page_amount: u32,
    pub inventory_page_amount: u32,
    pub flex_cards_amount: u32,
    pub card_type_page_amount: u32,

    pub max_friends: u32,
    pub max_trades: u32,

    //seconds
    pub pack_cooldown: u32,
    pub pack_amount: u32,
    pub pack_quality_min: i32,
    pub pack_quality_max: i32,

    //seconds
    pub trade_cooldown: u32,
    pub trade_card_limit: u32,

    //seconds
    pub pack_data_span: u32,
    pub pack_data_amount: u32,

    pub db_connection: String,

    pub card_image_base: String,
    pub frame_image_base: String,
    pub effect_image_base: String,
    pub achievements_image_base: String,
    pub badges_image_base: String,

    pub user_fs_base: String,
    pub collector_fs_base: String,
    pub card_fs_base: String,

    pub log_file: String,

    pub email: String,
    pub email_password: String,
    pub smtp_server: String,

    pub db_init_files: Vec<String>
}

impl Default for Config {
    fn default() -> Self {
        Self {
            port: 80,
            address: String::from("0.0.0.0"),

            //NOTE: important to change
            jwt_secret: String::from("CHANGE_THE_SECRET"),
            //jwt_duration: 60 * 15,
            jwt_duration: 20,

            refresh_token_secret: String::from("CHANGE_THE_SECRET"),
            refresh_token_duration: 60 * 60 * 24,
            
            refresh_token_rotation_strategy: true,

            domain: String::from("https://waifucollector.com"),
            verification_key_length: 20,
            verification_key_resend_cooldown: 30,
            id_length: 13,

            username_len_min: 4,
            username_len_max: 20,

            collector_len_min: 4,
            collector_len_max: 20,
            collector_desciption_len_min: 1,
            collector_desciption_len_max: 500,

            card_type_len_min: 4,
            card_type_len_max: 20,

            card_name_len_min: 3,
            card_name_len_max: 20,

            password_len_min: 8,
            password_len_max: 30,

            users_page_amount: 5,
            collectors_page_amount: 5,
            inventory_page_amount: 20,
            flex_cards_amount: 9,
            card_type_page_amount: 10,

            max_friends: 999,
            max_trades: 5,

            pack_cooldown: 30,
            pack_amount: 1,
            pack_quality_min: 1,
            pack_quality_max: 5,

            trade_cooldown: 60,
            trade_card_limit: 5,

            pack_data_span: 60,
            pack_data_amount: 30,

            db_connection: String::from("mysql://root@localhost/waifucollector"),

            card_image_base: String::from("card"),
            frame_image_base: String::from("frame"),
            effect_image_base: String::from("effect"),
            achievements_image_base: String::from("achievements"),
            badges_image_base: String::from("badges"),

            user_fs_base: String::from("static/user"),
            collector_fs_base: String::from("static/collector"),
            card_fs_base: String::from("static/card"),

            log_file: String::from("./log-file.log"),

            email: String::from("foo@bar.baz"),
            email_password: String::from("EMAIL_PASSWORD"),
            smtp_server: String::from("smtp.gmail.com"),

            db_init_files: vec![
                String::from("./sqlfiles/tables.sql"),
                /* String::from("./sqlfiles/cardtypes.sql"),
                String::from("./sqlfiles/cards.sql"),
                String::from("./sqlfiles/cardframes.sql"),
                String::from("./sqlfiles/cardeffects.sql"),
                String::from("./sqlfiles/achievements.sql") */
            ]
        }
    }
}

pub fn get_figment() -> Result<Figment, figment::Error> {
    Ok(Figment::from(rocket::Config::default())
        .merge(Serialized::defaults(Config::default()))
        .merge(Json::file("Config.json")))
}
