use actix_web::{
    get,
    middleware::Logger,
    web::{post, resource, Json, Path},
    App, HttpResponse, HttpServer, Responder,
};
use env_logger::Env;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
struct Person {
    name: String,
    age: u8,
}

async fn submit(data: Json<Person>) -> impl Responder {
    log::info!("Received {:?}", data);
    HttpResponse::Ok()
}

#[get("/{name}")]
async fn get_account(name: Path<String>) -> impl Responder {
    log::info!("Request to /{}", name);
    HttpResponse::Ok().json(Person {
        name: name.to_string(),
        age: 22,
    })
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::Builder::from_env(Env::default().default_filter_or("info")).init();
    HttpServer::new(|| {
        App::new()
            .wrap(Logger::default())
            .service(get_account)
            .service(resource("/create_account").route(post().to(submit)))
    })
    .bind(("0.0.0.0", 8080))?
    .run()
    .await
}
