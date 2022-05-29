mod kruskal;
mod utils;

use utils::Edge;

use std::{io, net::SocketAddr, sync::Arc};

use axum::{
    http::StatusCode,
    response::IntoResponse,
    routing::{get, get_service, post},
    Extension, Json, Router,
};
use tower_http::{compression::CompressionLayer, services::ServeDir, trace::TraceLayer};

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let app = Router::new()
        .route("/kruskal", post(kruskal))
        .route("/dijkstra", get(not_found))
        .fallback(get_service(ServeDir::new(".")).handle_error(handle_error))
        .layer(Extension(Arc::new(())))
        .layer(TraceLayer::new_for_http())
        .layer(CompressionLayer::new());

    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    tracing::info!("listening on {addr}");

    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}

async fn kruskal(Json(payload): Json<Vec<Edge>>) -> impl IntoResponse {
    Json(kruskal::solve(payload))
}

async fn handle_error(err: io::Error) -> impl IntoResponse {
    tracing::warn!("{err}");
    (StatusCode::INTERNAL_SERVER_ERROR, "Something went wrong...")
}

async fn not_found() -> impl IntoResponse {
    (StatusCode::NOT_FOUND, "Not found")
}