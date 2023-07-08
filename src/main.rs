use actix_cors::Cors;
use actix_web::{
    get,
    middleware::Logger,
    web::{self, post, resource, Data, Json, Path},
    App, HttpResponse, HttpServer, Responder,
};
use env_logger::Env;
use surrealdb::{engine::local::Db, Surreal};
use twit::{
    db::{
        check_user, clear_db, delete_post, get_all_users, get_db, get_post, get_posts,
        get_posts_from_user, get_replies_to_post, insert_post, insert_reply, insert_user,
        like_post,
    },
    models::*,
};

async fn user_exists(user: Json<User>, db: Data<Surreal<Db>>) -> impl Responder {
    log::info!("Received {:?}", user);

    match check_user(user.0, &db).await {
        Ok(u) => HttpResponse::Ok().json(u),
        Err(e) => {
            println!("Failed to execute query: {}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}

async fn create_user(user: Json<User>, db: Data<Surreal<Db>>) -> impl Responder {
    log::info!("Received {:?}", user);

    match insert_user(user.0, &db).await {
        Ok(u) => HttpResponse::Ok().json(u),
        Err(e) => {
            println!("Failed to execute query: {}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}

async fn create_msg(msg: Json<UserPost>, db: Data<Surreal<Db>>) -> impl Responder {
    log::info!("Received {:?}", msg);

    match insert_post(msg.0, &db).await {
        Ok(_) => {
            log::info!("Successfully created a new msg");
            HttpResponse::Ok().finish()
        }
        Err(e) => {
            println!("Failed to execute query: {}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}

async fn reply_msg(msg: Json<UserReply>, db: Data<Surreal<Db>>) -> impl Responder {
    log::info!("Received {:?}", msg);

    match insert_reply(msg.0, &db).await {
        Ok(_) => {
            log::info!("Successfully created a new reply");
            HttpResponse::Ok().finish()
        }
        Err(e) => {
            println!("Failed to execute query: {}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}

async fn delete_msg(msg: Json<String>, db: Data<Surreal<Db>>) -> impl Responder {
    log::info!("MESSAGE TO DELETE: {:?}", msg);

    match delete_post(msg.0, &db).await {
        Ok(_) => {
            log::info!("Successfully deleted a msg");
            HttpResponse::Ok().finish()
        }
        Err(e) => {
            println!("Failed to execute query: {}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}

async fn like_msg(post: Json<LikePost>, db: Data<Surreal<Db>>) -> impl Responder {
    log::info!("Received {:?}", post);

    match like_post(post.0, &db).await {
        Ok(_) => {
            log::info!("Successfully (un)liked a msg");
            HttpResponse::Ok().finish()
        }
        Err(e) => {
            println!("Failed to execute query: {}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}

#[get("/msgs")]
async fn get_msgs(db: Data<Surreal<Db>>) -> impl Responder {
    log::info!("Request to /msgs");
    match get_posts(&db).await {
        Ok(msgs) => HttpResponse::Ok().json(msgs),
        Err(e) => {
            println!("Failed to execute query: {}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}

#[get("/msg/{id}")]
async fn get_replies(id: Path<String>, db: Data<Surreal<Db>>) -> impl Responder {
    log::info!("Request to /msg/{id}");
    match get_replies_to_post(id.to_string(), &db).await {
        Ok(msg) => HttpResponse::Ok().json(msg),
        Err(e) => {
            println!("Failed to execute query: {}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}

#[get("/user/{user}")]
async fn get_me(user: Path<String>, db: Data<Surreal<Db>>) -> impl Responder {
    log::info!("Request to /{user}");
    match get_posts_from_user(user.to_string(), &db).await {
        Ok(user) => HttpResponse::Ok().json(user),
        Err(e) => {
            println!("Failed to execute query: {}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}

#[get("/users")]
async fn get_users(db: Data<Surreal<Db>>) -> impl Responder {
    log::info!("Request to /users");
    match get_all_users(&db).await {
        Ok(users) => {
            log::info!("THE USERS ARE: {users:?}");
            HttpResponse::Ok().json(users)
        }
        Err(e) => {
            log::info!("Failed to execute query: {}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::Builder::from_env(Env::default().default_filter_or("info")).init();
    let db = get_db().await.expect("The db to exist");
    HttpServer::new(move || {
        let cors = Cors::permissive();
        App::new()
            .app_data(web::Data::new(db.clone()))
            .wrap(Logger::default())
            .wrap(cors)
            .service(get_msgs)
            .service(get_replies)
            .service(get_me)
            .service(get_users)
            .service(resource("/user_exists").route(post().to(user_exists)))
            .service(resource("/create_user").route(post().to(create_user)))
            .service(resource("/create_msg").route(post().to(create_msg)))
            .service(resource("/delete_msg").route(post().to(delete_msg)))
            .service(resource("/like_msg").route(post().to(like_msg)))
            .service(resource("/reply_msg").route(post().to(reply_msg)))
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
