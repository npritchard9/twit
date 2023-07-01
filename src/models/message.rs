use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Serialize, Deserialize, Debug)]
pub struct Message {
    pub userid: Uuid,
    pub content: String,
    pub id: Uuid,
}

impl Message {
    pub fn new(userid: Uuid, content: String) -> Self {
        Message {
            userid,
            content,
            id: Uuid::new_v4(),
        }
    }
}
