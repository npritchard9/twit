use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export)]
pub struct User {
    pub name: String,
    pub password: String,
    pub bio: String,
}

impl User {
    pub fn new(name: String, password: String, bio: String) -> Self {
        User {
            name,
            password,
            bio,
        }
    }
}
