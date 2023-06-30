use super::user::User;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Serialize, Deserialize, Debug)]
pub struct Message {
    pub user: User,
    pub content: String,
    pub id: String, // Uuid
}

impl Message {
    pub fn new(user: User, content: String) -> Self {
        Message {
            user,
            content,
            id: Uuid::new_v4().to_string(),
        }
    }
}
