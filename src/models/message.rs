use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use ts_rs::TS;
use uuid::Uuid;

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export)]
pub struct Message {
    pub userid: String,
    pub content: String,
    pub ts: DateTime<Utc>,
    pub likes: i64,
    pub id: String,
}

impl Message {
    pub fn new(userid: String, content: String) -> Self {
        Message {
            userid,
            content,
            ts: Utc::now(),
            likes: 0,
            id: Uuid::new_v4().to_string(),
        }
    }
}
