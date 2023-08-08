use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use surrealdb::opt::RecordId;
use ts_rs::TS;

use super::User;

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct UserPost {
    pub msg: String,
    pub user: String,
}

#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct DBPost {
    pub msg: String,
    #[ts(type = "string")]
    pub user: RecordId,
    pub likes: u32,
    pub ts: DateTime<Utc>,
    #[ts(type = "string")]
    pub id: RecordId,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct UserReply {
    pub msg: String,
    pub user: String,
    pub postid: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct LikePost {
    pub user: String,
    pub id: String,
}

#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct UserAndPost {
    pub user: User,
    pub post: DBPost,
}
