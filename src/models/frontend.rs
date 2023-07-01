use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct FUser {
    pub name: String,
    pub bio: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FMessage {
    pub content: String,
    pub userid: Uuid,
}
