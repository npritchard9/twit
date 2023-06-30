use actix_web::{
    get,
    middleware::Logger,
    web::{self, post, resource, Json, Path},
    App, HttpResponse, HttpServer, Responder,
};
use dockerprac::{
    db::get_db,
    models::{Message, User},
};
use env_logger::Env;

async fn create_user(user: Json<User>) -> impl Responder {
    log::info!("Received {:?}", user);
    HttpResponse::Ok()
}

async fn create_msg(msg: Json<Message>) -> impl Responder {
    log::info!("Received {:?}", msg);
    HttpResponse::Ok()
}

#[get("/")]
async fn get_msgs() -> impl Responder {
    log::info!("Request to /");
    HttpResponse::Ok()
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::Builder::from_env(Env::default().default_filter_or("info")).init();
    let pool = get_db().await.expect("The db to exist");
    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(pool.clone()))
            .wrap(Logger::default())
            .service(get_msgs)
            .service(resource("/create_user").route(post().to(create_user)))
            .service(resource("/create_msg").route(post().to(create_msg)))
    })
    .bind(("0.0.0.0", 8080))?
    .run()
    .await
}
