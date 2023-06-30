use sqlx::{postgres::PgPoolOptions, Pool, Postgres};
use std::env;

pub async fn get_db() -> Result<Pool<Postgres>, anyhow::Error> {
    dotenvy::dotenv()?;
    let db_url = env::var("DB_URL").expect("DB_URL needs to exist");
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await?;
    Ok(pool)
}
