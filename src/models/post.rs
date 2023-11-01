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

#[derive(Debug, Serialize, Deserialize)]
pub struct DBPost {
    pub msg: String,
    pub user: RecordId,
    pub likes: u32,
    pub ts: DateTime<Utc>,
    pub id: RecordId,
}

#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Post {
    pub msg: String,
    pub user: String,
    pub likes: u32,
    pub ts: DateTime<Utc>,
    pub id: String,
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

#[derive(Debug, Serialize, Deserialize)]
pub struct UserAndDBPost {
    pub user: User,
    pub post: DBPost,
}

#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct UserAndPost {
    pub user: User,
    pub post: Post,
}

impl From<UserAndDBPost> for UserAndPost {
    fn from(value: UserAndDBPost) -> Self {
        Self {
            user: value.user,
            post: Post {
                msg: value.post.msg,
                user: value.post.user.id.to_raw(),
                likes: value.post.likes,
                ts: value.post.ts,
                id: value.post.id.id.to_raw(),
            },
        }
    }
}
