//! GET /metrics — Prometheus 文本格式

use axum::response::{IntoResponse, Response};
use axum::http::{header, StatusCode};

use crate::metrics::prometheus::PROMETHEUS;

pub async fn prometheus_metrics() -> Response {
    let body = PROMETHEUS.render();
    (
        StatusCode::OK,
        [(header::CONTENT_TYPE, "text/plain; version=0.0.4; charset=utf-8")],
        body,
    )
        .into_response()
}
