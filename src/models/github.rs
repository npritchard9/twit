use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Serialize, Deserialize)]
pub struct GHToken {
    access_token: String,
    scope: String,
    token_type: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GithubUser {
    pub login: String,
    pub id: i64,
    #[serde(rename = "node_id")]
    pub node_id: String,
    #[serde(rename = "avatar_url")]
    pub avatar_url: String,
    #[serde(rename = "gravatar_id")]
    pub gravatar_id: String,
    pub url: String,
    #[serde(rename = "html_url")]
    pub html_url: String,
    #[serde(rename = "followers_url")]
    pub followers_url: String,
    #[serde(rename = "following_url")]
    pub following_url: String,
    #[serde(rename = "gists_url")]
    pub gists_url: String,
    #[serde(rename = "starred_url")]
    pub starred_url: String,
    #[serde(rename = "subscriptions_url")]
    pub subscriptions_url: String,
    #[serde(rename = "organizations_url")]
    pub organizations_url: String,
    #[serde(rename = "repos_url")]
    pub repos_url: String,
    #[serde(rename = "events_url")]
    pub events_url: String,
    #[serde(rename = "received_events_url")]
    pub received_events_url: String,
    #[serde(rename = "type")]
    pub type_field: String,
    #[serde(rename = "site_admin")]
    pub site_admin: bool,
    pub name: String,
    pub company: Value,
    pub blog: String,
    pub location: Value,
    pub email: Value,
    pub hireable: Value,
    pub bio: Value,
    #[serde(rename = "twitter_username")]
    pub twitter_username: Value,
    #[serde(rename = "public_repos")]
    pub public_repos: i64,
    #[serde(rename = "public_gists")]
    pub public_gists: i64,
    pub followers: i64,
    pub following: i64,
    #[serde(rename = "created_at")]
    pub created_at: String,
    #[serde(rename = "updated_at")]
    pub updated_at: String,
    #[serde(rename = "private_gists")]
    pub private_gists: i64,
    #[serde(rename = "total_private_repos")]
    pub total_private_repos: i64,
    #[serde(rename = "owned_private_repos")]
    pub owned_private_repos: i64,
    #[serde(rename = "disk_usage")]
    pub disk_usage: i64,
    pub collaborators: i64,
    #[serde(rename = "two_factor_authentication")]
    pub two_factor_authentication: bool,
    pub plan: Plan,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Plan {
    pub name: String,
    pub space: i64,
    pub collaborators: i64,
    #[serde(rename = "private_repos")]
    pub private_repos: i64,
}
