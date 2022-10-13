mod compression;
mod critical_path;
mod floyd_warshall;
mod handles;
mod kruskal;
mod max_flow;
mod pert;
mod utils;

use crate::handles::{
    compression, critical_path, floyd_warshall, handle_error, kruskal, max_flow, not_found, pert,
};

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
        .route("/flujomaximo", post(max_flow))
        .route("/floydwarshall", post(floyd_warshall))
        .route("/cpm", post(critical_path))
        .route("/pert", post(pert))
        .route("/compression", post(compression))
        .route("/dijkstra", get(not_found))
        .fallback(get_service(ServeDir::new(".")).handle_error(handle_error))
        .layer(Extension(Arc::new(())))
        .layer(TraceLayer::new_for_http())
        .layer(CompressionLayer::new());

    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    tracing::info!("listening on http://{addr}");

    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}
