use std::io;

use crate::{
    kruskal as Kruskal,
    max_flow::{self, MaxFlow},
    utils::Edge,
};

use axum::{http::StatusCode, response::IntoResponse, Json};

pub(crate) async fn kruskal(Json(payload): Json<Vec<Edge>>) -> impl IntoResponse {
    Json(Kruskal::solve(payload))
}

pub(crate) async fn flujo_maximo(Json(payload): Json<MaxFlow>) -> impl IntoResponse {
    Json(max_flow::solve(payload))
}

pub(crate) async fn handle_error(err: io::Error) -> impl IntoResponse {
    tracing::warn!("{err}");
    (StatusCode::INTERNAL_SERVER_ERROR, "Something went wrong...")
}

pub(crate) async fn not_found() -> impl IntoResponse {
    (StatusCode::NOT_FOUND, "Not found")
}
