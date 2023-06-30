use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Serialize, Deserialize, Debug)]
pub struct User {
    pub name: String,
    pub age: u8,
    pub bio: String,
    pub id: String, // Uuid
}

impl User {
    pub fn new(name: String, age: u8, bio: String) -> Self {
        User {
            name,
            age,
            bio,
            id: Uuid::new_v4().to_string(),
        }
    }
}
