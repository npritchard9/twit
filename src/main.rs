use actix_cors::Cors;
use actix_web::{
    get,
    http::header,
    middleware::Logger,
    web::{post, resource, Data, Json, Path, Query},
    App, HttpResponse, HttpServer, Responder,
};
use dotenvy::dotenv;
use env_logger::Env;
use oauth2::{
    basic::BasicClient, reqwest::async_http_client, AuthUrl, AuthorizationCode, ClientId,
    ClientSecret, CsrfToken, RedirectUrl, Scope, TokenResponse, TokenUrl,
};
use serde::Deserialize;
use std::env;
use surrealdb::{engine::local::Db, Surreal};
use twit::{db::*, models::*};

struct AppState {
    oauth: BasicClient,
    db: Surreal<Db>,
}

#[derive(Deserialize)]
struct AuthRequest {
    code: String,
    state: String,
}

async fn create_msg(msg: Json<UserPost>, data: Data<AppState>) -> impl Responder {
    log::info!("Received {:?}", msg);

    match insert_post(msg.0, &data.db).await {
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

async fn reply_msg(msg: Json<UserReply>, data: Data<AppState>) -> impl Responder {
    log::info!("Received {:?}", msg);

    match insert_reply(msg.0, &data.db).await {
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

async fn delete_msg(post: Json<LikePost>, data: Data<AppState>) -> impl Responder {
    log::info!("MESSAGE TO DELETE: {:?}", post);

    match delete_post(post.0, &data.db).await {
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

async fn like_msg(post: Json<LikePost>, data: Data<AppState>) -> impl Responder {
    log::info!("MESSAGE TO LIKE: {:?}", post);

    match like_post(post.0, &data.db).await {
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
async fn get_msgs(data: Data<AppState>) -> impl Responder {
    log::info!("Request to /msgs");
    match get_posts(&data.db).await {
        Ok(msgs) => HttpResponse::Ok().json(msgs),
        Err(e) => {
            println!("Failed to execute query: {}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}

#[get("/msg/{id}")]
async fn get_msg(id: Path<String>, data: Data<AppState>) -> impl Responder {
    log::info!("Request to /msg/{id}");
    match get_post(id.to_string(), &data.db).await {
        Ok(msg) => HttpResponse::Ok().json(msg),
        Err(e) => {
            println!("Failed to execute query: {}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}

#[get("/msg/{id}/replies")]
async fn get_replies(id: Path<String>, data: Data<AppState>) -> impl Responder {
    log::info!("Request to /msg/{id}/replies");
    match get_replies_to_post(id.to_string(), &data.db).await {
        Ok(msg) => HttpResponse::Ok().json(msg),
        Err(e) => {
            println!("Failed to execute query: {}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}

#[get("/user/{user}")]
async fn get_me(user: Path<String>, data: Data<AppState>) -> impl Responder {
    log::info!("Request to /{user}");
    match get_posts_from_user(user.to_string(), &data.db).await {
        Ok(user) => HttpResponse::Ok().json(user),
        Err(e) => {
            println!("Failed to execute query: {}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}

#[get("/users")]
async fn get_users(data: Data<AppState>) -> impl Responder {
    log::info!("Request to /users");
    match get_all_users(&data.db).await {
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

#[get("/{name}/likes/{postid}")]
async fn get_user_likes_msg(path: Path<(String, String)>, data: Data<AppState>) -> impl Responder {
    let (name, postid) = path.into_inner();
    log::info!("Request to /{}/likes/{}", name, postid);
    match get_user_likes_post(name.to_string(), postid.to_string(), &data.db).await {
        Ok(likes) => {
            log::info!("USER LIKES POST: {likes}");
            HttpResponse::Ok().json(likes)
        }
        Err(e) => {
            log::info!("Failed to execute query: {}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}

#[get("/login")]
async fn login(data: Data<AppState>) -> impl Responder {
    let (authorize_url, _csrf_state) = data
        .oauth
        .authorize_url(CsrfToken::new_random)
        .add_scope(Scope::new("openid email profile".into()))
        .url();
    HttpResponse::Found()
        .insert_header((header::LOCATION, authorize_url.to_string()))
        .finish()
}

#[get("/auth/google")]
async fn auth_google(data: Data<AppState>, params: Query<AuthRequest>) -> impl Responder {
    let code = AuthorizationCode::new(params.code.clone());
    let _state = CsrfToken::new(params.state.clone());
    let token_res = &data
        .oauth
        .exchange_code(code)
        .request_async(async_http_client)
        .await;
    match token_res {
        Ok(token) => {
            let name = get_user_from_google(format!("{:?}", token.access_token().secret()))
                .await
                .expect("To be able to get the current google user");

            match check_user(&name, &data.db).await {
                Ok(_) => HttpResponse::Found()
                    .insert_header((
                        header::LOCATION,
                        format!("http://localhost:3000/users/{name}"),
                    ))
                    .finish(),
                Err(_check_error) => {
                    let user = User {
                        name: name.clone(),
                        bio: String::from(""),
                    };
                    match insert_user(user, &data.db).await {
                        Ok(_) => HttpResponse::Found()
                            .insert_header((
                                header::LOCATION,
                                format!("http://localhost:3000/users/{name}"),
                            ))
                            .finish(),

                        Err(insert_error) => {
                            log::info!("Failed to execute query: {}", insert_error);
                            HttpResponse::InternalServerError().finish()
                        }
                    }
                }
            }
        }
        Err(e) => {
            log::info!("Failed to execute query: {}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}

async fn get_user_from_google(token: String) -> anyhow::Result<String> {
    let client = reqwest::Client::new();
    let res = client
        .get("https://openidconnect.googleapis.com/v1/userinfo")
        .bearer_auth(token)
        .send()
        .await?
        .json::<GoogleUser>()
        .await?;
    Ok(res.email.split_once("@").unwrap().0.into())
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::Builder::from_env(Env::default().default_filter_or("info")).init();

    dotenv().ok();

    let db = get_db().await.expect("The db to exist");
    HttpServer::new(move || {
        let google_client_id = ClientId::new(
            env::var("GOOGLE_CLIENT_ID")
                .expect("Missing the GOOGLE_CLIENT_ID environment variable."),
        );
        let google_client_secret = ClientSecret::new(
            env::var("GOOGLE_CLIENT_SECRET")
                .expect("Missing the GOOGLE_CLIENT_SECRET environment variable."),
        );
        let auth_url = AuthUrl::new("https://accounts.google.com/o/oauth2/v2/auth".to_string())
            .expect("Invalid authorization endpoint URL");
        let token_url = TokenUrl::new("https://www.googleapis.com/oauth2/v3/token".to_string())
            .expect("Invalid token endpoint URL");

        let client = BasicClient::new(
            google_client_id,
            Some(google_client_secret),
            auth_url,
            Some(token_url),
        )
        .set_redirect_uri(
            RedirectUrl::new("http://localhost:8080/auth/google".to_string())
                .expect("Invalid redirect URL"),
        );
        let cors = Cors::permissive();
        App::new()
            .app_data(Data::new(AppState {
                oauth: client,
                db: db.clone(),
            }))
            .wrap(Logger::default())
            .wrap(cors)
            .service(login)
            .service(auth_google)
            .service(get_msg)
            .service(get_msgs)
            .service(get_replies)
            .service(get_me)
            .service(get_users)
            .service(get_user_likes_msg)
            .service(resource("/create_msg").route(post().to(create_msg)))
            .service(resource("/delete_msg").route(post().to(delete_msg)))
            .service(resource("/like_msg").route(post().to(like_msg)))
            .service(resource("/reply_msg").route(post().to(reply_msg)))
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
