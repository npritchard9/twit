use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export)]
pub struct Message {
    pub userid: String,
    pub content: String,
    pub ts: DateTime<Utc>,
}

impl Message {
    pub fn new(userid: String, content: String) -> Self {
        Message {
            userid,
            content,
            ts: Utc::now(),
        }
    }
}
