use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Serialize, Deserialize, Debug)]
pub struct Person {
    pub name: String,
    pub password: String,
    pub bio: String,
    pub id: Uuid,
}

impl Person {
    pub fn new(name: String, password: String, bio: String) -> Self {
        Person {
            name,
            password,
            bio,
            id: Uuid::new_v4(),
        }
    }
}
