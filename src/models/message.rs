use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export)]
pub struct Message {
    pub usr: String,
    pub content: String,
    pub ts: DateTime<Utc>,
    pub likes: i64,
    pub path: Option<String>,
}

impl Message {
    pub fn new(usr: String, content: String) -> Self {
        Message {
            usr,
            content,
            ts: Utc::now(),
            likes: 0,
            path: None,
        }
    }
}

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export)]
pub struct DBMessage {
    pub usr: String,
    pub content: String,
    pub ts: DateTime<Utc>,
    pub likes: i64,
    pub id: i64,
    pub path: Option<String>,
}
