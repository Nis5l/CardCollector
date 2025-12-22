use chrono::{DateTime, Utc};
use serde::{Serialize, Deserialize};
use sqlx::FromRow;
use rocket::form::FromFormField;
use serde_repr::Serialize_repr;
use std::convert::From;

use crate::shared::{Id, IdInt};

#[derive(Debug, Serialize, Clone, FromRow)]
#[serde(rename_all="camelCase")]
pub struct CardInfo {
    pub id: Id,
    #[sqlx(rename="cardUserId")]
    pub user_id: Id,
    #[sqlx(rename="cardName")]
    pub name: String,
    pub time: DateTime<Utc>,
    pub state: CardState,
    pub update_card: Option<Box<CardInfo>>
}

#[derive(Debug, Serialize)]
pub struct CardFrame {
    pub id: IdInt,
    pub name: String,
}

#[derive(Debug, Serialize, FromRow)]
#[serde(rename_all="camelCase")]
pub struct CardTypeDb {
    pub ctid: Id,
    pub ctname: String,
    pub uid: Id,
    pub ctstate: i32,
    pub ctupdatectid: Option<Id>
}

#[derive(Debug, Serialize, Clone, FromRow)]
#[serde(rename_all="camelCase")]
pub struct CardType {
    pub id: Id,
    pub name: String,
    pub user_id: Id,
    pub state: CardState,
    pub update_card_type: Option<Box<CardType>>
}

#[derive(Debug, Serialize)]
pub struct CardEffect {
    pub id: IdInt,
    pub opacity: f32
}

#[derive(Debug, Serialize, Clone)]
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
    pub time: DateTime<Utc>,

    pub card_frame: Option<CardFrame>,
    pub card_effect: Option<CardEffect>,

    pub card: Card,
}

impl From<CardTypeDb> for CardType {
    fn from(card_type_db: CardTypeDb) -> Self {
        CardType {
            id: card_type_db.ctid,
            user_id: card_type_db.uid,
            name: card_type_db.ctname,
            state: CardState::from(card_type_db.ctstate),
            update_card_type: None
        }
    }
}

impl CardType {
    fn from_with_update<T: Into<CardType>>(card_type_db: CardTypeDb, update: Option<T>) -> Self {
        let mut card_type = CardType::from(card_type_db);
        if let Some(update_card) = update {
            card_type.update_card_type = Some(Box::new(update_card.into()));
        }
        card_type
    }
}

impl From<(CardTypeDb, CardType)> for CardType {
    fn from((db, update): (CardTypeDb, CardType)) -> Self {
        Self::from_with_update(db, Some(update))
    }
}

impl From<(CardTypeDb, CardTypeDb)> for CardType {
    fn from((db, update_db): (CardTypeDb, CardTypeDb)) -> Self {
        Self::from_with_update(db, Some(update_db))
    }
}

impl From<(CardTypeDb, Option<CardType>)> for CardType {
    fn from((db, update): (CardTypeDb, Option<CardType>)) -> Self {
        Self::from_with_update(db, update)
    }
}

impl From<(CardTypeDb, Option<CardTypeDb>)> for CardType {
    fn from((db, update_db): (CardTypeDb, Option<CardTypeDb>)) -> Self {
        Self::from_with_update(db, update_db)
    }
}

impl From<UnlockedCardDb> for UnlockedCard {
    fn from(card: UnlockedCardDb) -> Self {
        UnlockedCard {
            id: card.id,
            user_id: card.user_id,
            level: card.level,
            quality: card.quality,
            time: card.time,
            card_frame: match (card.frame_id, card.frame_name) {
                (Some(id), Some(name)) => Some(CardFrame { id, name }),
                _ => None
            },
            card_effect: match (card.effect_id, card.effect_opacity) {
                (Some(id), Some(opacity)) => Some(CardEffect { id, opacity }),
                _ => None
            },
            card: Card::from(CardDb {
                card_type_user_id: card.card_type_user_id,
                card_id: card.card_id,
                collector_id: card.collector_id,
                card_name: card.card_name,
                card_user_id: card.card_user_id,
                card_time: card.card_time,
                update_card: None,
                type_state: card.type_state,
                card_state: card.card_state,

                type_id: card.type_id,
                type_name: card.type_name,
                type_time: card.type_time
            })
        }
    }
}

impl From<CardDb> for Card {
    fn from(card: CardDb) -> Self {
        Card {
            collector_id: card.collector_id,
            card_info: CardInfo {
                id: card.card_id,
                user_id: card.card_user_id,
                name: card.card_name,
                time: card.card_time,
                state: CardState::from(card.card_state),
                update_card: None,
            },
            card_type: CardType {
                id: card.type_id,
                name: card.type_name,
                user_id: card.card_type_user_id,
                update_card_type: None,
                state: CardState::from(card.type_state)
            }
        }
    }
}

impl Card {
    fn from_with_update<T: Into<Card>>(card_db: CardDb, update: Option<T>) -> Self {
        let mut card = Card::from(card_db);
        if let Some(update_card) = update {
            card.card_info.update_card = Some(Box::new(update_card.into().card_info));
        }
        card
    }
}

impl From<(CardDb, Card)> for Card {
    fn from((db, update): (CardDb, Card)) -> Self {
        Self::from_with_update(db, Some(update))
    }
}

impl From<(CardDb, CardDb)> for Card {
    fn from((db, update_db): (CardDb, CardDb)) -> Self {
        Self::from_with_update(db, Some(update_db))
    }
}

impl From<(CardDb, Option<Card>)> for Card {
    fn from((db, update): (CardDb, Option<Card>)) -> Self {
        Self::from_with_update(db, update)
    }
}

impl From<(CardDb, Option<CardDb>)> for Card {
    fn from((db, update_db): (CardDb, Option<CardDb>)) -> Self {
        Self::from_with_update(db, update_db)
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
    pub time: DateTime<Utc>,

    pub card_type_user_id: Id,
    pub card_id: Id,
    pub card_user_id: Id,
    pub card_name: String,
    pub card_time: DateTime<Utc>,
    pub card_state: i32,

    pub type_id: Id,
    pub type_name: String,
    pub type_state: i32,
    pub type_time: DateTime<Utc>,

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
    pub card_time: DateTime<Utc>,
    pub update_card: Option<Id>,
    pub card_state: i32,

    pub type_state: i32,
    pub type_id: Id,
    pub type_name: String,
    pub type_time: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct UnlockedCardCreateData {
    pub card_id: Id,
    pub frame_id: Option<IdInt>,
    pub quality: i32,
    pub level: i32
}

#[derive(Debug, Clone, Serialize_repr, FromFormField)]
#[repr(i32)]
pub enum CardState {
    #[field(value = "0")]
    Requested = 0,
    #[field(value = "1")]
    Created = 1,
}

impl From<i32> for CardState {
    fn from(value: i32) -> Self {
        match value {
            0 => Self::Requested,
            _ => Self::Created
        }
    }
}

impl<'de> Deserialize<'de> for CardState {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
       where D: serde::Deserializer<'de> {
            let i = i32::deserialize(deserializer)?;

            Ok(CardState::from(i))
       }
}

#[derive(Debug, FromFormField, Serialize_repr)]
#[repr(i32)]
pub enum SortType {
    Name = 0,
    Level = 1,
    Recent = 2,
    CardType = 3
}

impl Default for SortType {
    fn default() -> Self {
        Self::Name
    }
}

impl From<i32> for SortType {
    fn from(value: i32) -> Self {
        match value {
            1 => Self::Level,
            2 => Self::Recent,
            3 => Self::CardType,
            _ => Self::Name
        }
    }
}

impl<'de> Deserialize<'de> for SortType {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
       where D: serde::Deserializer<'de> {
            let i = i32::deserialize(deserializer)?;

            Ok(Self::from(i))
       }
}

#[derive(Debug, FromFormField, Serialize_repr)]
#[repr(i32)]
pub enum CardSortType {
    Name = 0,
    CardType = 1,
    Recent = 2
}

impl Default for CardSortType {
    fn default() -> Self {
        Self::Name
    }
}

impl From<i32> for CardSortType {
    fn from(value: i32) -> Self {
        match value {
            1 => Self::CardType,
            2 => Self::Recent,
            _ => Self::Name,
        }
    }
}

impl<'de> Deserialize<'de> for CardSortType {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
       where D: serde::Deserializer<'de> {
            let i = i32::deserialize(deserializer)?;

            Ok(CardSortType::from(i))
       }
}

#[derive(Debug, FromFormField, Serialize_repr)]
#[repr(i32)]
pub enum CardTypeSortType {
    Name = 0,
    Recent = 1
}

impl Default for CardTypeSortType {
    fn default() -> Self {
        Self::Name
    }
}

impl From<i32> for CardTypeSortType {
    fn from(value: i32) -> Self {
        match value {
            1 => Self::Recent,
            _ => Self::Name,
        }
    }
}

impl<'de> Deserialize<'de> for CardTypeSortType {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
       where D: serde::Deserializer<'de> {
            let i = i32::deserialize(deserializer)?;

            Ok(CardTypeSortType::from(i))
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

impl From<i32> for CardVote {
    fn from(value: i32) -> Self {
        match value {
            0 => Self::Neutral,
            n if n < 0 => Self::Downvote,
            _ => Self::Upvote,
        }
    }
}

impl<'de> Deserialize<'de> for CardVote {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
       where D: serde::Deserializer<'de> {
            let i = i32::deserialize(deserializer)?;

            Ok(CardVote::from(i))
       }
}
