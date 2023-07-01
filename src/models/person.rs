use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export)]
pub struct Person {
    pub name: String,
    pub password: String,
    pub bio: String,
}

impl Person {
    pub fn new(name: String, password: String, bio: String) -> Self {
        Person {
            name,
            password,
            bio,
        }
    }
}
