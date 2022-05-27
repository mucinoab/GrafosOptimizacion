use std::{io, net::SocketAddr};

use axum::{http::StatusCode, response::IntoResponse, routing::get_service, Json, Router};
use serde::{Deserialize, Serialize};
use tokio::signal;
use tower_http::{
    services::{ServeDir, ServeFile},
    trace::TraceLayer,
};

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let file_404 = ServeFile::new("./static/404.html" /*TODO*/);

    let static_files = get_service(ServeDir::new("./static").not_found_service(file_404.clone()))
        .handle_error(handle_error);

    let static_js_files =
        get_service(ServeDir::new("./js").not_found_service(file_404)).handle_error(handle_error);

    let app = Router::new()
        .route("/", static_files)
        .route("/js", static_js_files)
        .layer(TraceLayer::new_for_http());

    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    tracing::info!("listening on {}", addr);

    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .with_graceful_shutdown(shutdown_signal())
        .await
        .unwrap();
}

async fn _create_user(Json(payload): Json<CreateUser>) -> impl IntoResponse {
    let user = User {
        id: 1337,
        username: payload.username,
    };

    (StatusCode::CREATED, Json(user))
}

async fn handle_error(_err: io::Error) -> impl IntoResponse {
    tracing::info!("500");
    (StatusCode::INTERNAL_SERVER_ERROR, "Something went wrong...")
}

async fn shutdown_signal() {
    let ctrl_c = async {
        signal::ctrl_c()
            .await
            .expect("failed to install Ctrl+C handler");
    };

    let terminate = async {
        signal::unix::signal(signal::unix::SignalKind::terminate())
            .expect("failed to install signal handler")
            .recv()
            .await;
    };

    tokio::select! {
        _ = ctrl_c => {},
        _ = terminate => {},
    }

    tracing::info!("signal received, starting graceful shutdown");
}

// the input to our `create_user` handler
#[derive(Deserialize)]
struct CreateUser {
    username: String,
}

// the output to our `create_user` handler
#[derive(Serialize)]
struct User {
    id: u64,
    username: String,
}
