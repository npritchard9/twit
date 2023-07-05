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
    pub fn new(usr: String, content: String, path: Option<String>) -> Self {
        Message {
            usr,
            content,
            ts: Utc::now(),
            likes: 0,
            path,
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

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export)]
pub struct DBReply {
    pub usr: Option<String>,
    pub content: Option<String>,
    pub ts: Option<DateTime<Utc>>,
    pub likes: Option<i64>,
    pub id: Option<i64>,
    pub path: Option<String>,
}
