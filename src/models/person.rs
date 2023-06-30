use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Serialize, Deserialize, Debug)]
pub struct Person {
    pub name: String,
    pub bio: String,
    pub id: Uuid,
}

impl Person {
    pub fn new(name: String, bio: String) -> Self {
        Person {
            name,
            bio,
            id: Uuid::new_v4(),
        }
    }
}
