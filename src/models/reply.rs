use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use ts_rs::TS;
use uuid::Uuid;

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export)]
pub struct Reply {
    pub userid: String,
    pub msgid: String,
    pub content: String,
    pub ts: DateTime<Utc>,
    pub likes: i64,
    pub id: String,
}

impl Reply {
    pub fn new(userid: String, msgid: String, content: String) -> Self {
        Reply {
            userid,
            msgid,
            content,
            ts: Utc::now(),
            likes: 0,
            id: Uuid::new_v4().to_string(),
        }
    }
}
