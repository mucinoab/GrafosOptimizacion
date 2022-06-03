mod floyd_warshall;
mod handles;
mod kruskal;
mod max_flow;
mod utils;

use handles::*;

use std::{net::SocketAddr, sync::Arc};

use axum::{
    routing::{get, get_service, post},
    Extension, Router,
};
use tower_http::{compression::CompressionLayer, services::ServeDir, trace::TraceLayer};

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let app = Router::new()
        .route("/kruskal", post(kruskal))
        .route("/flujomaximo", post(flujo_maximo))
        .route("/floydwarshall", post(floyd_warshall))
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
