use actix_cors::Cors;
use actix_web::{
    get,
    middleware::Logger,
    web::{self, post, resource, Data, Json},
    App, HttpResponse, HttpServer, Responder,
};
use dockerprac::{
    db::get_db,
    models::{FMessage, FUser, Message, Person},
};
use env_logger::Env;
use sqlx::PgPool;

async fn create_user(user: Json<FUser>, pool: Data<PgPool>) -> impl Responder {
    log::info!("Received {:?}", user);

    let person = Person::new(user.name.clone(), user.bio.clone());

    match sqlx::query!(
        r#"
        INSERT INTO person (name, bio, id)
        VALUES ($1, $2, $3)
        "#,
        person.name,
        person.bio,
        person.id
    )
    .execute(pool.get_ref())
    .await
    {
        Ok(_) => HttpResponse::Ok().finish(),
        Err(e) => {
            println!("Failed to execute query: {}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}

async fn create_msg(msg: Json<FMessage>, pool: Data<PgPool>) -> impl Responder {
    log::info!("Received {:?}", msg);

    let msg = Message::new(msg.userid, msg.content.clone());

    match sqlx::query!(
        r#"
        INSERT INTO message (userid, content, id)
        VALUES ($1, $2, $3)
        "#,
        msg.userid,
        msg.content,
        msg.id
    )
    .execute(pool.get_ref())
    .await
    {
        Ok(_) => {
            log::info!("Successfully created a new msg");
            HttpResponse::Ok()
                .finish()
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
    match sqlx::query_as!(Message, r"select * from message")
        .fetch_all(&mut conn)
        .await
    {
        Ok(msgs) => HttpResponse::Ok()
            .json(msgs),
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
    match sqlx::query_as!(Person, r"select * from person")
        .fetch_all(&mut conn)
        .await
    {
        Ok(msgs) => HttpResponse::Ok()
            .json(msgs),
        Err(e) => {
            println!("Failed to execute query: {}", e);
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
            .service(get_users)
            .service(resource("/create_user").route(post().to(create_user)))
            .service(resource("/create_msg").route(post().to(create_msg)))
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
