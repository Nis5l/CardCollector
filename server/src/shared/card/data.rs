use serde::{Serialize, Deserialize};
use sqlx::FromRow;
use rocket::form::FromFormField;
use serde_repr::Serialize_repr;

use crate::config::Config;
use crate::shared::{Id, IdInt};

#[derive(Debug, Serialize, FromRow)]
#[serde(rename_all="camelCase")]
pub struct CardInfo {
    pub id: Id,
    #[sqlx(rename="cardUserId")]
    pub user_id: Id,
    #[sqlx(rename="cardName")]
    pub name: String,
}

#[derive(Debug, Serialize)]
pub struct CardFrame {
    pub id: IdInt,
    pub name: String,
}

#[derive(Debug, Serialize, FromRow)]
#[serde(rename_all="camelCase")]
pub struct CardType {
    pub id: Id,
    pub name: String,
    #[sqlx(rename="userId")]
    pub user_id: Id,
}

#[derive(Debug, Serialize)]
pub struct CardEffect {
    pub id: IdInt,
    pub opacity: f32
}

#[derive(Debug, Serialize)]
#[serde(rename_all="camelCase")]
pub struct Card {
    pub collector_id: Id,
    pub card_info: CardInfo,
    pub card_type: CardType,
}

#[derive(Debug, Serialize)]
#[serde(rename_all="camelCase")]
pub struct UnlockedCard {
    pub id: Id,
    pub user_id: Id,
    pub level: i32,
    pub quality: i32,

    pub card_frame: Option<CardFrame>,
    pub card_effect: Option<CardEffect>,

    pub card: Card,
}

impl UnlockedCard {
    pub fn from_card_db(card: UnlockedCardDb, config: &Config) -> Self {
        UnlockedCard {
            id: card.id,
            user_id: card.user_id,
            level: card.level,
            quality: card.quality,
            card_frame: match (card.frame_id, card.frame_name) {
                (Some(id), Some(name)) => Some(CardFrame { id, name }),
                _ => None
            },
            card_effect: match (card.effect_id, card.effect_opacity) {
                (Some(id), Some(opacity)) => Some(CardEffect { id, opacity }),
                _ => None
            },
            card: Card::from_card_db(CardDb {
                card_type_user_id: card.card_type_user_id,
                card_id: card.card_id,
                collector_id: card.collector_id,
                card_name: card.card_name,
                card_user_id: card.card_user_id,

                type_id: card.type_id,
                type_name: card.type_name,
            }, config)
        }
    }
}

impl Card {
    pub fn from_card_db(card: CardDb, config: &Config) -> Self {
        Card {
            collector_id: card.collector_id,
            card_info: CardInfo {
                id: card.card_id,
                user_id: card.card_user_id,
                name: card.card_name,
            },
            card_type: CardType {
                id: card.type_id,
                name: card.type_name,
                user_id: card.card_type_user_id,
            }
        }
    }
}

#[derive(Debug, Serialize, FromRow)]
#[serde(rename_all="camelCase")]
#[sqlx(rename_all = "camelCase")]
pub struct UnlockedCardDb {
    pub id: Id,
    pub user_id: Id,
    pub collector_id: Id,
    pub level: i32,
    pub quality: i32,

    pub card_type_user_id: Id,
    pub card_id: Id,
    pub card_user_id: Id,
    pub card_name: String,

    pub type_id: Id,
    pub type_name: String,

    pub frame_id: Option<IdInt>,
    pub frame_name: Option<String>,

    pub effect_id: Option<IdInt>,
    pub effect_opacity: Option<f32>
}

#[derive(Debug, Serialize, FromRow)]
#[serde(rename_all="camelCase")]
#[sqlx(rename_all = "camelCase")]
pub struct CardDb {
    pub card_type_user_id: Id,
    pub card_id: Id,
    pub card_user_id: Id,
    pub collector_id: Id,
    pub card_name: String,

    pub type_id: Id,
    pub type_name: String,
}

#[derive(Debug, Serialize)]
pub struct UnlockedCardCreateData {
    pub card_id: Id,
    pub frame_id: Option<IdInt>,
    pub quality: i32,
    pub level: i32
}

#[derive(Debug, Clone, FromFormField)]
pub enum CardState {
    #[field(value = "0")]
    Requested = 0,
    #[field(value = "1")]
    Created = 1,
}

impl<'de> Deserialize<'de> for CardState {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
       where D: serde::Deserializer<'de> {
            let i = i32::deserialize(deserializer)?;

            Ok(match i {
                0 => Self::Requested,
                _ => Self::Created
            })
       }
}

#[derive(Debug)]
pub enum SortType {
    Name = 0,
    Level = 1,
    Recent = 2
}

impl Default for SortType {
    fn default() -> Self {
        Self::Name
    }
}

impl<'de> Deserialize<'de> for SortType {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
       where D: serde::Deserializer<'de> {
            let i = i32::deserialize(deserializer)?;

            Ok(match i {
                1 => Self::Level,
                2 => Self::Recent,
                _ => Self::Name
            })
       }
}

pub struct InventoryOptions {
    pub user_id: Id,
    pub collector_id: Id,
    pub count: u32,
    pub offset: u32,
    pub search: String,
    pub exclude_uuids: Vec<Id>,
    pub sort_type: SortType,
    pub level: Option<i32>,
    pub card_id: Option<Id>
}

#[derive(Debug, Clone, Copy, FromFormField, Serialize_repr)]
#[repr(i32)]
pub enum CardVote {
    Neutral = 0,
    Upvote = 1,
    Downvote = -1,
}

impl<'de> Deserialize<'de> for CardVote {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
       where D: serde::Deserializer<'de> {
            let i = i32::deserialize(deserializer)?;

            Ok(if i == 0 {
                Self::Neutral
            } else if i < 0 {
                Self::Downvote
            } else {
                Self::Upvote
            })
       }
}

impl CardVote {
    pub fn from_db(vote: i32) -> Self {
        if vote == 0 {
            Self::Neutral
        } else if vote < 0 {
            Self::Downvote
        } else {
            Self::Upvote
        }
    }
}

