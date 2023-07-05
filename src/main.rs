use actix_cors::Cors;
use actix_web::{
    get,
    middleware::Logger,
    web::{self, post, resource, Data, Json, Path},
    App, HttpResponse, HttpServer, Responder,
};
use dockerprac::{
    db::get_db,
    models::{
        CheckUser, DBMessage, DBReply, DeleteMessage, IncomingUser, LikeMessage, Message, Person,
        ReplyMessage, UserMessage,
    },
};
use env_logger::Env;
use sqlx::PgPool;

async fn user_exists(user: Json<CheckUser>, pool: Data<PgPool>) -> impl Responder {
    log::info!("Received {:?}", user);

    match sqlx::query_as!(
        Person,
        r#"
        SELECT * FROM person WHERE name = $1 and password = $2
        "#,
        user.name,
        user.password,
    )
    .fetch_one(pool.get_ref())
    .await
    {
        Ok(p) => HttpResponse::Ok().json(p),
        Err(e) => {
            println!("Failed to execute query: {}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}

async fn create_user(user: Json<IncomingUser>, pool: Data<PgPool>) -> impl Responder {
    log::info!("Received {:?}", user);

    let person = Person::new(user.name.clone(), user.password.clone(), user.bio.clone());

    match sqlx::query!(
        r#"
        INSERT INTO person (name, password, bio)
        VALUES ($1, $2, $3)
        "#,
        person.name,
        person.password,
        person.bio,
    )
    .execute(pool.get_ref())
    .await
    {
        Ok(_) => HttpResponse::Ok().json(person),
        Err(e) => {
            println!("Failed to execute query: {}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}

async fn create_msg(msg: Json<UserMessage>, pool: Data<PgPool>) -> impl Responder {
    log::info!("Received {:?}", msg);

    let msg = Message::new(msg.usr.clone(), msg.content.clone(), None);

    match sqlx::query!(
        r#"
        INSERT INTO message (content, usr, ts, likes)
        VALUES ($1, $2, $3, $4)
        "#,
        msg.content,
        msg.usr,
        msg.ts,
        msg.likes,
    )
    .execute(pool.get_ref())
    .await
    {
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

async fn reply_msg(msg: Json<ReplyMessage>, pool: Data<PgPool>) -> impl Responder {
    log::info!("Received {:?}", msg);

    let msg = Message::new(msg.usr.clone(), msg.content.clone(), msg.path.clone());

    match sqlx::query!(
        r#"
        INSERT INTO message (content, usr, ts, likes, path)
        VALUES ($1, $2, $3, $4, $5)
        "#,
        msg.content,
        msg.usr,
        msg.ts,
        msg.likes,
        msg.path
    )
    .execute(pool.get_ref())
    .await
    {
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

async fn delete_msg(msg: Json<DeleteMessage>, pool: Data<PgPool>) -> impl Responder {
    log::info!("MESSAGE TO DELETE: {:?}", msg);

    match sqlx::query!(
        r#"
        DELETE FROM message WHERE id = $1
        "#,
        msg.id,
    )
    .execute(pool.get_ref())
    .await
    {
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

async fn like_msg(msg: Json<LikeMessage>, pool: Data<PgPool>) -> impl Responder {
    log::info!("Received {:?}", msg);

    let query = match msg.like {
        true => {
            sqlx::query!(
                r#"
                UPDATE message set likes = likes + 1 WHERE id = $1 
                "#,
                msg.id
            )
            .execute(pool.get_ref())
            .await
        }
        false => {
            sqlx::query!(
                r#"
                UPDATE message set likes = likes - 1 WHERE id = $1 
                "#,
                msg.id
            )
            .execute(pool.get_ref())
            .await
        }
    };
    match query {
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
async fn get_msgs(pool: Data<PgPool>) -> impl Responder {
    log::info!("Request to /msgs");
    let mut conn = pool
        .acquire()
        .await
        .expect("To be able to connect to the pool");
    match sqlx::query_as!(DBMessage, r"select * from message where path is null order by ts desc")
        .fetch_all(&mut conn)
        .await
    {
        Ok(msgs) => HttpResponse::Ok().json(msgs),
        Err(e) => {
            println!("Failed to execute query: {}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}

#[get("/msg/{id}")]
async fn get_replies(id: Path<i64>, pool: Data<PgPool>) -> impl Responder {
    log::info!("Request to /msg/{id}");
    let mut conn = pool
        .acquire()
        .await
        .expect("To be able to connect to the pool");
    match sqlx::query_as!(
        DBReply,
        r"WITH base_msgs AS (SELECT * FROM message WHERE path IS NULL)
        (SELECT * FROM message replies WHERE replies.path ~ ANY(SELECT CAST(id as text) FROM base_msgs))
	    UNION ALL SELECT * FROM base_msgs"
    )
    .fetch_all(&mut conn)
    .await
    {
        Ok(msgs) => HttpResponse::Ok().json(msgs),
        Err(e) => {
            println!("Failed to execute query: {}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}

#[get("/user/{user}")]
async fn get_me(user: Path<String>, pool: Data<PgPool>) -> impl Responder {
    log::info!("Request to /{user}");
    let mut conn = pool
        .acquire()
        .await
        .expect("To be able to connect to the pool");
    match sqlx::query_as!(
        DBMessage,
        r"select * from message where usr = ($1) order by ts desc",
        &user.to_string()
    )
    .fetch_all(&mut conn)
    .await
    {
        Ok(user) => HttpResponse::Ok().json(user),
        Err(e) => {
            println!("Failed to execute query: {}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}

#[get("/users")]
async fn get_users(pool: Data<PgPool>) -> impl Responder {
    log::info!("Request to /users");
    let mut conn = pool
        .acquire()
        .await
        .expect("To be able to connect to the pool");
    match sqlx::query_as!(Person, r"select * from person order by name")
        .fetch_all(&mut conn)
        .await
    {
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
    let pool = get_db().await.expect("The db to exist");
    HttpServer::new(move || {
        let cors = Cors::permissive();
        App::new()
            .app_data(web::Data::new(pool.clone()))
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
