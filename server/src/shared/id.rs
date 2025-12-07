use std::{fmt, convert, str};
use serde::{Serialize, Deserialize, de::Visitor};
use rocket::request::FromParam;
use rocket::form::FromForm;

use crate::shared::crypto::random_string::generate_random_string;

#[derive(Debug, Clone, sqlx::Type, Serialize, FromForm)]
#[sqlx(transparent)]
pub struct Id(String);

impl Id {
    pub fn new(len: usize) -> Self {
        Self(generate_random_string(len))
    }

    pub fn set(&mut self, value: String) {
        self.0 = value.to_lowercase();
    }
}

impl convert::From<String> for Id {
    fn from(value: String) -> Self {
        Self(value.to_lowercase())
    }
}

impl convert::From<&str> for Id {
    fn from(value: &str) -> Self {
        Self(String::from(value).to_lowercase())
    }
}

impl std::ops::Deref for Id {
    type Target = String;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl PartialEq for Id {
    fn eq(&self, other: &Self) -> bool {
        self.0 == other.0
    }
}

impl fmt::Display for Id {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl str::FromStr for Id {
    type Err = ();

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Ok(Self::from(s))
    }
}

impl<'a> FromParam<'a> for Id {
    type Error = ();

    fn from_param(param: &'a str) -> Result<Self, Self::Error> {
        Ok(Self::from(param))
    }
}

struct IdVisitor;

//https://docs.rs/serde/latest/src/serde/de/impls.rs.html#473
impl<'de> Visitor<'de> for IdVisitor {
    type Value = Id;

    fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
        formatter.write_str("an id")
    }

    fn visit_str<E>(self, v: &str) -> Result<Self::Value, E>
    where
        E: serde::de::Error,
    {
        Ok(Id::from(v.to_owned()))
    }

    fn visit_string<E>(self, v: String) -> Result<Self::Value, E>
    where
        E: serde::de::Error,
    {
        Ok(Id::from(v))
    }

    fn visit_bytes<E>(self, v: &[u8]) -> Result<Self::Value, E>
    where
        E: serde::de::Error,
    {
        match str::from_utf8(v) {
            Ok(s) => Ok(Id::from(s.to_owned())),
            Err(_) => Err(serde::de::Error::invalid_value(serde::de::Unexpected::Bytes(v), &self)),
        }
    }

    fn visit_byte_buf<E>(self, v: Vec<u8>) -> Result<Self::Value, E>
    where
        E: serde::de::Error,
    {
        match String::from_utf8(v) {
            Ok(s) => Ok(Id::from(s)),
            Err(e) => Err(serde::de::Error::invalid_value(
                serde::de::Unexpected::Bytes(&e.into_bytes()),
                &self,
            )),
        }
    }
}

struct IdInPlaceVisitor<'a>(&'a mut Id);

impl<'a, 'de> Visitor<'de> for IdInPlaceVisitor<'a> {
    type Value = ();

    fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
        formatter.write_str("a string")
    }

    fn visit_str<E>(self, v: &str) -> Result<Self::Value, E>
    where
        E: serde::de::Error,
    {
        self.0.set(String::from(v));
        Ok(())
    }

    fn visit_string<E>(self, v: String) -> Result<Self::Value, E>
    where
        E: serde::de::Error,
    {
        *self.0 = Id::from(v);
        Ok(())
    }

    fn visit_bytes<E>(self, v: &[u8]) -> Result<Self::Value, E>
    where
        E: serde::de::Error,
    {
        match str::from_utf8(v) {
            Ok(s) => {
                self.0.set(String::from(s));
                Ok(())
            }
            Err(_) => Err(serde::de::Error::invalid_value(serde::de::Unexpected::Bytes(v), &self)),
        }
    }

    fn visit_byte_buf<E>(self, v: Vec<u8>) -> Result<Self::Value, E>
    where
        E: serde::de::Error,
    {
        match String::from_utf8(v) {
            Ok(s) => {
                *self.0 = Id::from(s);
                Ok(())
            }
            Err(e) => Err(serde::de::Error::invalid_value(
                serde::de::Unexpected::Bytes(&e.into_bytes()),
                &self,
            )),
        }
    }
}

impl<'a> Deserialize<'a> for Id {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
       where D: serde::Deserializer<'a> {
        deserializer.deserialize_str(IdVisitor)
    }

    fn deserialize_in_place<D>(deserializer: D, place: &mut Self) -> Result<(), D::Error>
       where D: serde::Deserializer<'a>, {
        deserializer.deserialize_string(IdInPlaceVisitor(place))
    }
}
