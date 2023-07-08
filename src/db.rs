use anyhow::anyhow;
use surrealdb::engine::local::{Db, File};
use surrealdb::Surreal;

use super::models::*;

pub async fn get_db() -> surrealdb::Result<Surreal<Db>> {
    let db = Surreal::new::<File>("posts.db").await?;
    db.use_ns("my_ns").use_db("my_db").await?;
    Ok(db)
}

pub async fn get_all_users(db: &Surreal<Db>) -> anyhow::Result<Vec<User>> {
    let users = db.select("user").await?;
    Ok(users)
}

pub async fn check_user(user: User, db: &Surreal<Db>) -> anyhow::Result<User> {
    let u = db.select(("user", user.name)).await?;
    Ok(u)
}

pub async fn insert_user(user: User, db: &Surreal<Db>) -> anyhow::Result<User> {
    let u = db.create(("user", user.name.clone())).content(user).await?;
    Ok(u)
}

pub async fn insert_post(post: UserPost, db: &Surreal<Db>) -> anyhow::Result<DBPost> {
    let mut res = db
        .query(format!(
            "create post set msg = '{}', likes = 0, ts = time::now()",
            post.msg
        ))
        .await?;
    let p: Option<DBPost> = res.take(0)?;
    match p {
        Some(m) => {
            println!("CREATED POST: {m:?}");
            let _relate = db
                .query(format!("relate user:{}->wrote->{}", post.user, m.id))
                .await?;
            Ok(m)
        }
        None => Err(anyhow!("Unable to create a post")),
    }
}

pub async fn get_post(id: String, db: &Surreal<Db>) -> anyhow::Result<DBPost> {
    let split: Vec<&str> = id.split(":").collect();
    let post: DBPost = db.select((split[0], split[1])).await?;
    Ok(post)
}

pub async fn get_posts(db: &Surreal<Db>) -> anyhow::Result<Vec<UserAndPost>> {
    let mut res = db
        .query("select in.* as user, out.* as post from wrote")
        .await?;
    let posts = res.take(0)?;
    Ok(posts)
}

pub async fn get_posts_from_user(
    user: String,
    db: &Surreal<Db>,
) -> anyhow::Result<Vec<UserAndPost>> {
    let mut res = db
        .query(format!(
            "select in.* as user, out.* as post from wrote where in = user:{}",
            user
        ))
        .await?;
    let posts = res.take(0)?;
    Ok(posts)
}

pub async fn get_replies_to_post(postid: String, db: &Surreal<Db>) -> anyhow::Result<Vec<DBPost>> {
    let mut replies = db
        .query(format!(
            "select value in.* from replied where {} = out",
            postid
        ))
        .await?;
    let r = replies.take(0)?;
    Ok(r)
}

pub async fn insert_reply(reply: UserReply, db: &Surreal<Db>) -> anyhow::Result<()> {
    let post = UserPost {
        msg: reply.msg,
        likes: 0,
        user: reply.user.clone(),
    };
    let r = insert_post(post, db).await?;
    let _relate_to_post = db
        .query(format!("relate {}->replied->{}", r.id, reply.postid))
        .await?;
    Ok(())
}

pub async fn delete_post(post: LikePost, db: &Surreal<Db>) -> anyhow::Result<()> {
    let split: Vec<&str> = post.id.split(":").collect();
    let _post: Option<DBPost> = db.delete((split[0], split[1])).await?;
    let _remove_user = db
        .query(format!(
            "delete user:{}->wrote where out = {}",
            &post.user, &post.id
        ))
        .await?;
    Ok(())
}

pub async fn like_post(post: LikePost, db: &Surreal<Db>) -> anyhow::Result<()> {
    let mut liked_res = db
        .query(format!(
            "select value count() from liked where (user:{} = in and {} = out) limit 1",
            &post.user, &post.id
        ))
        .await?;
    println!("LIKED RES: {:#?}", liked_res);
    let user_already_liked: Option<i32> = liked_res.take(0)?;
    println!("USER ALREADY LIKED? {user_already_liked:?}");
    if let Some(_) = user_already_liked {
        let _remove_like = db
            .query(format!("update {} set likes -= 1", &post.id))
            .await?;
        let _remove_user = db
            .query(format!(
                "delete user:{}->liked where out = {}",
                &post.user, &post.id
            ))
            .await?;
    } else {
        let _add_like = db
            .query(format!("update {} set likes += 1", &post.id))
            .await?;
        let _relate_user = db
            .query(format!("relate user:{}->liked->{}", &post.user, &post.id))
            .await?;
    }
    Ok(())
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
