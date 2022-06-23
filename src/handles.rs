use std::io;

use crate::{
    critical_path as Critical_path, floyd_warshall as Floyd_warshall, kruskal as Kruskal,
    max_flow::{self, MaxFlow},
    pert as Pert,
    utils::Edge,
};

use axum::{http::StatusCode, response::IntoResponse, Json};

pub async fn kruskal(Json(payload): Json<Vec<Edge>>) -> impl IntoResponse {
    Json(Kruskal::solve(payload))
}

pub async fn max_flow(Json(payload): Json<MaxFlow>) -> impl IntoResponse {
    Json(max_flow::solve(payload))
}

pub async fn floyd_warshall(Json(payload): Json<Vec<Edge>>) -> impl IntoResponse {
    Json(Floyd_warshall::solve(payload))
}

pub async fn critical_path(Json(payload): Json<Vec<Edge>>) -> impl IntoResponse {
    Json(Critical_path::solve(payload))
}

pub async fn pert(Json(payload): Json<Vec<Edge>>) -> impl IntoResponse {
    Json(Pert::solve(payload))
}

#[tracing::instrument]
pub async fn handle_error(err: io::Error) -> impl IntoResponse {
    tracing::error!("{err}");
    (StatusCode::INTERNAL_SERVER_ERROR, "Something went wrong...")
}

#[tracing::instrument]
pub async fn not_found() -> impl IntoResponse {
    (StatusCode::NOT_FOUND, "Not found")
}
