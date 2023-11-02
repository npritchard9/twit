use anyhow::anyhow;
use surrealdb::engine::local::{Db, SpeeDb};
use surrealdb::Surreal;

use super::models::*;

pub async fn get_db() -> surrealdb::Result<Surreal<Db>> {
    let db = Surreal::new::<SpeeDb>("~/rustprac/twit/posts.db").await?;
    db.use_ns("my_ns").use_db("my_db").await?;
    Ok(db)
}

pub async fn get_all_users(db: &Surreal<Db>) -> anyhow::Result<Vec<User>> {
    let users = db.select("user").await?;
    Ok(users)
}

pub async fn check_user(user: &str, db: &Surreal<Db>) -> anyhow::Result<User> {
    let user: Option<User> = db.select(("user", user)).await?;
    match user {
        Some(u) => Ok(u),
        None => Err(anyhow!("Error retrieving user from db")),
    }
}

pub async fn insert_user(user: User, db: &Surreal<Db>) -> anyhow::Result<User> {
    let user: Option<User> = db.create(("user", user.name.clone())).content(user).await?;
    match user {
        Some(u) => Ok(u),
        None => Err(anyhow!("Error inserting user into db")),
    }
}

pub async fn insert_post(post: UserPost, db: &Surreal<Db>) -> anyhow::Result<()> {
    let mut _res = db
        .query(format!(
            "let $post = create post set msg = '{}', user = user:{}, likes = 0, ts = time::now();
            relate user:{}->wrote->($post.id);",
            post.msg,
            post.user.clone(),
            post.user
        ))
        .await?;
    Ok(())
}

pub async fn get_post(id: String, db: &Surreal<Db>) -> anyhow::Result<UserAndPost> {
    let mut res = db
        .query(format!("select <-user.* as user, ->post.* as post from wrote where out = post:{} split post, user", id))
        .await?;
    let dbpost: Option<UserAndDBPost> = res.take(0)?;
    if let Some(post) = dbpost {
        let p = UserAndPost::from(post);
        Ok(p)
    } else {
        Err(anyhow!("This user and post have to exist in the db"))
    }
}

pub async fn get_posts(db: &Surreal<Db>) -> anyhow::Result<Vec<UserAndPost>> {
    let mut res = db
        .query("select <-user.* as user, ->post.* as post from wrote split post, user")
        .await?;
    let dbposts: Vec<UserAndDBPost> = res.take(0)?;
    let posts: Vec<UserAndPost> = dbposts.into_iter().map(|p| UserAndPost::from(p)).collect();
    Ok(posts)
}

pub async fn get_posts_from_user(
    user: String,
    db: &Surreal<Db>,
) -> anyhow::Result<Vec<UserAndPost>> {
    let mut res = db
        .query(format!(
            "select <-user.* as user, ->post.* as post from wrote where in = user:{} split post, user",
            user
        ))
        .await?;
    let dbposts: Vec<UserAndDBPost> = res.take(0)?;
    let posts: Vec<UserAndPost> = dbposts.into_iter().map(|p| UserAndPost::from(p)).collect();
    Ok(posts)
}

pub async fn get_replies_to_post(
    postid: String,
    db: &Surreal<Db>,
) -> anyhow::Result<Vec<UserAndPost>> {
    let mut replies = db
        .query(format!(
            "select in.* as post, in.user.* as user from replied where out = post:{} split post, user",
            postid
        ))
        .await?;
    let r: Vec<UserAndDBPost> = replies.take(0)?;
    let r = r.into_iter().map(|r| UserAndPost::from(r)).collect();
    Ok(r)
}

pub async fn insert_reply(reply: UserReply, db: &Surreal<Db>) -> anyhow::Result<()> {
    let mut _res = db
        .query(format!(
            "let $reply = create post set msg = '{}', user = 'user:{}', likes = 0, ts = time::now();
            relate user:{}->wrote->($reply.id);
            relate ($reply.id)->replied->post:{};
            ",
            reply.msg, reply.user, reply.user, reply.postid
        ))
        .await?;
    Ok(())
}

pub async fn delete_post(post: LikePost, db: &Surreal<Db>) -> anyhow::Result<()> {
    let _post: Option<DBPost> = db.delete(("post", post.id)).await?;
    Ok(())
}

pub async fn like_post(post: LikePost, db: &Surreal<Db>) -> anyhow::Result<()> {
    let mut liked_res = db
        .query(format!(
            "select count() from liked where user:{} = in and post:{} = out group all",
            &post.user, &post.id
        ))
        .await?;
    let user_already_liked: Option<Count> = liked_res.take(0)?;
    if let Some(Count { count: c }) = user_already_liked {
        println!("LIKE COUNT: {c}");
        let _remove_like = db
            .query(format!("update post:{} set likes -= 1", &post.id))
            .await?;
        let _remove_user = db
            .query(format!(
                "delete user:{}->liked where out = post:{}",
                &post.user, &post.id
            ))
            .await?;
    } else {
        println!("USER HASN'T LIKED: {user_already_liked:#?}");
        let _add_like = db
            .query(format!("update post:{} set likes += 1", &post.id))
            .await?;
        let _relate_user = db
            .query(format!(
                "relate user:{}->liked->post:{}",
                &post.user, &post.id
            ))
            .await?;
    }
    Ok(())
}

pub async fn get_user_likes_post(
    user: String,
    postid: String,
    db: &Surreal<Db>,
) -> anyhow::Result<bool> {
    let mut liked_res = db
        .query(format!(
            "select count() from liked where user:{} = in and post:{} = out group all",
            &user, &postid
        ))
        .await?;
    let user_already_liked: Option<Count> = liked_res.take(0)?;
    if let Some(Count { count: _ }) = user_already_liked {
        Ok(true)
    } else {
        Ok(false)
    }
}

pub async fn get_likes(user: String, db: &Surreal<Db>) -> anyhow::Result<Vec<DBPost>> {
    let mut res = db
        .query(format!("select out.* from liked where user:{} = in", user))
        .await?;
    let likes = res.take(0)?;
    Ok(likes)
}

pub async fn clear_db(db: &Surreal<Db>) -> anyhow::Result<()> {
    let _posts: Vec<DBPost> = db.delete("post").await?;
    let _users: Vec<User> = db.delete("user").await?;
    Ok(())
}
