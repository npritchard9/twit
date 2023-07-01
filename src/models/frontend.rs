use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct IncomingUser {
    pub name: String,
    pub password: String,
    pub bio: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CheckUser {
    pub name: String,
    pub password: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UserMessage {
    pub content: String,
    pub userid: Uuid,
}
