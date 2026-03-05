//! 路由层入口
//!
//! # 子模块
//!
//! | 模块 | 职责 |
//! |------|------|
//! | [`model_router`] | `ProviderType`、`RouteInfo`、`ModelRouter`（路由决策）|
//! | [`registry`]     | 静态模型注册表（MVP 硬编码，后续改为 DB 驱动）|
//!
//! # RouterState
//!
//! Axum 共享状态，通过 `Router::with_state(state)` 注入。
//! 所有字段均为 Arc 级别 Clone，clone 开销极低。

pub mod model_router;
pub mod registry;

pub use model_router::{ModelRouter, ProviderType, RouteInfo};
pub use registry::build_default_registry;

use std::sync::Arc;

use crate::config::AppConfig;

/// Axum 全局共享状态
#[derive(Clone)]
pub struct RouterState {
    /// Postgres 连接池
    /// - Key 验证（缓存未命中时回源）
    /// - 原子扣费事务
    /// - 模型定价查询
    pub db: sqlx::PgPool,

    /// Redis 连接管理器（自动重连）
    /// - Key 元数据缓存（TTL 30min）
    /// - 吊销时立即删除（Next.js 调用）
    pub redis: redis::aio::ConnectionManager,

    /// reqwest 共享连接池（转发请求到 AI Provider）
    pub http_client: reqwest::Client,

    /// 模型 → Provider 路由表
    pub model_router: ModelRouter,

    /// 全局配置（Provider API Key、缓存 TTL 等）
    pub config: Arc<AppConfig>,
}

impl RouterState {
    pub fn new(db: sqlx::PgPool, redis: redis::aio::ConnectionManager) -> Self {
        // 读取代理配置（来自 .env）
        let proxy_enabled = std::env::var("PROXY_ENABLED")
            .map(|v| v.to_lowercase() == "true")
            .unwrap_or(false);
        let proxy_url = std::env::var("PROXY_URL").ok();

        let mut builder = reqwest::Client::builder()
            .timeout(std::time::Duration::from_secs(120))
            .pool_max_idle_per_host(20);

        if proxy_enabled {
            if let Some(url) = &proxy_url {
                match reqwest::Proxy::all(url) {
                    Ok(proxy) => {
                        builder = builder.proxy(proxy);
                        tracing::info!("HTTP client proxy enabled: {}", url);
                    }
                    Err(e) => {
                        tracing::warn!("Invalid PROXY_URL '{}', proxy disabled: {}", url, e);
                    }
                }
            } else {
                tracing::warn!("PROXY_ENABLED=true but PROXY_URL is not set, proxy disabled");
            }
        }

        let http_client = builder
            .build()
            .expect("failed to build reqwest client");

        let config       = Arc::new(AppConfig::from_env());
        let routes       = build_default_registry();
        let model_router = ModelRouter::new(routes, config.providers.openai_base_url.clone());

        Self { db, redis, http_client, model_router, config }
    }
}
