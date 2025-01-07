use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct FriendAcceptResponse {
    pub message: String
}
