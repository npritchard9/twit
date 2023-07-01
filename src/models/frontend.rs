use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct IncomingUser {
    pub name: String,
    pub password: String,
    pub bio: String,
}

#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct CheckUser {
    pub name: String,
    pub password: String,
}

#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct UserMessage {
    pub content: String,
    pub userid: String,
}
