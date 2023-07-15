use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export)]
pub struct CheckUser {
    pub name: String,
}

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export)]
pub struct User {
    pub name: String,
    pub bio: String,
}

impl User {
    pub fn new(name: String, bio: String) -> Self {
        User { name, bio }
    }
}
