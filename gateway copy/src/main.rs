//! Gateway 启动入口
//!
//! 启动顺序：
//! 1. 初始化结构化日志（tracing）
//! 2. 加载 .env 环境变量
//! 3. 连接 Postgres（sqlx PgPool）
//! 4. 连接 Redis（ConnectionManager，自动重连）
//! 5. 构造 RouterState
//! 6. 自检各上游 AI Provider 联通情况（可选失败退出）
//! 7. 注册路由 + 中间件
//! 8. 监听端口，自检 API 可联通后进入服务循环，优雅关机

use axum::{routing::{get, post}, Router};
use std::net::SocketAddr;
use tower_http::cors::{Any, CorsLayer};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod config;
mod db;
mod error;
mod api;
mod metrics;
mod middleware;
mod protocol;
mod providers;
mod proxy;
mod router;
mod public;
mod startup_check;

#[tokio::main]
async fn main() {
    // ── 日志 ──────────────────────────────────────────────────────────────────
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "info,openrouter_gateway=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    dotenv::dotenv().ok();

    public::logo::print();
    tracing::info!("Starting OpenRouter Gateway...");

    // ── Postgres ──────────────────────────────────────────────────────────────
    let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");

    let db = sqlx::postgres::PgPoolOptions::new()
        .max_connections(20)
        .acquire_timeout(std::time::Duration::from_secs(5))
        .connect(&database_url)
        .await
        .unwrap_or_else(|e| {
            tracing::error!("Failed to connect to Postgres: {e}");
            std::process::exit(1);
        });
    tracing::info!("Connected to Postgres");

    // ── Redis ─────────────────────────────────────────────────────────────────
    let redis_url = std::env::var("REDIS_URL")
        .unwrap_or_else(|_| "redis://127.0.0.1:6379".to_string());

    let redis_client = redis::Client::open(redis_url.as_str())
        .unwrap_or_else(|e| { tracing::error!("Invalid REDIS_URL: {e}"); std::process::exit(1); });

    let redis = redis::aio::ConnectionManager::new(redis_client)
        .await
        .unwrap_or_else(|e| { tracing::error!("Failed to connect to Redis: {e}"); std::process::exit(1); });
    tracing::info!("Connected to Redis");

    // ── 构造共享状态 ──────────────────────────────────────────────────────────
    let state = router::RouterState::new(db, redis);

    // ── 启动自检：各上游网格联通情况 ────────────────────────────────────────────
    startup_check::check_upstreams(state.config.clone()).await;

    // ── 路由 + 中间件 ─────────────────────────────────────────────────────────
    let cors = CorsLayer::new().allow_origin(Any).allow_methods(Any).allow_headers(Any);

    let app = Router::new()
        .route("/health",                      get(api::health::health_check))
        .route("/v1/models",                   get(api::models::list_models))
        .route("/v1/models/{model}/pricing",   get(api::models::get_model_pricing))
        .route("/v1/chat/completions",         post(api::chat::chat_completions))
        .route("/v1/usage",                    get(api::usage::get_usage_stats))
        .with_state(state)
        .layer(cors)
        .layer(tower_http::trace::TraceLayer::new_for_http());

    // ── 监听 ──────────────────────────────────────────────────────────────────
    let port: u16 = std::env::var("PORT")
        .unwrap_or_else(|_| "3001".to_string()).parse().expect("PORT must be a number");
    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    tracing::info!("Listening on {addr}");

    let listener = tokio::net::TcpListener::bind(addr).await
        .unwrap_or_else(|e| {
            tracing::error!("Failed to bind to {addr}: {e}");
            std::process::exit(1);
        });

    let server = tokio::spawn(async move {
        axum::serve(listener, app)
            .with_graceful_shutdown(shutdown_signal())
            .await
            .unwrap_or_else(|e| tracing::error!("Server error: {e}"));
    });

    startup_check::check_api_reachable(port).await;

    server.await.expect("server task panicked");

    tracing::info!("Gateway shut down cleanly.");
}

async fn shutdown_signal() {
    let ctrl_c = async { tokio::signal::ctrl_c().await.expect("ctrl-c handler failed") };

    #[cfg(unix)]
    let terminate = async {
        tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
            .expect("SIGTERM handler failed").recv().await;
    };
    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c    => tracing::info!("Ctrl-C received"),
        _ = terminate => tracing::info!("SIGTERM received"),
    }
}
