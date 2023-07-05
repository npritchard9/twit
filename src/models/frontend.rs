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
    pub usr: String,
}

#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct DeleteMessage {
    pub id: i64,
}

#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct LikeMessage {
    pub id: i64,
    pub like: bool,
}

#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct ReplyMessage {
    pub id: i64,
    pub content: String,
    pub usr: String,
    pub path: Option<String>,
}
