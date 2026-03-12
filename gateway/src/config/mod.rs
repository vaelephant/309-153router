//! 全局配置模块
//!
//! [`AppConfig`] 在启动时从环境变量加载一次，之后以 `Arc<AppConfig>` 的形式
//! 注入所有需要它的组件（RouterState、handlers 等）。
//!
//! # 所有环境变量
//!
//! | 变量 | 模块 | 说明 |
//! |------|------|------|
//! | `DATABASE_URL` | — | Postgres 连接串 |
//! | `REDIS_URL` | — | Redis 连接串（默认 redis://127.0.0.1:6379）|
//! | `PORT` | — | 监听端口（默认 9115）|
//! | `OPENAI_API_KEY` | providers | OpenAI 平台 Key |
//! | `ANTHROPIC_API_KEY` | providers | Anthropic 平台 Key |
//! | `GOOGLE_API_KEY` | providers | Google 平台 Key |
//! | `OPENAI_BASE_URL` | providers | 覆盖 OpenAI Base URL（兼容接口）|
//! | `PROVIDER_TIMEOUT_SECS` | providers | 上游请求超时（默认 120）|
//! | `PROVIDER_POOL_MAX_IDLE` | providers | 连接池大小（默认 20）|
//! | `KEY_CACHE_TTL_SECS` | cache | API Key Redis 缓存 TTL（默认 1800）|
//! | `PROXY_ENABLED` | proxy | 是否启用 HTTP 代理（true 启用，默认 false）|
//! | `PROXY_URL` | proxy | 代理地址（如 http://127.0.0.1:7890）|
//! | `GATEWAY_STARTUP_CHECK_EXIT_ON_FAIL` | startup_check | 自检任一下游失败时退出（1/true 时退出，默认仅打日志）|

pub mod loader;
pub mod providers;

pub use loader::{load as load_toml, GatewayTomlConfig};
pub use providers::ProviderConfig;

use crate::router::model_router::ProviderType;

// ─── HTTP 代理 ────────────────────────────────────────────────────────────────

/// 供启动日志使用：返回 "off" 或脱敏后的 PROXY_URL（不创建 Proxy）。
pub fn proxy_display_for_startup() -> String {
    let enabled = std::env::var("PROXY_ENABLED")
        .map(|v| matches!(v.to_lowercase().as_str(), "true" | "1" | "yes"))
        .unwrap_or(false);
    if !enabled {
        return "off".to_string();
    }
    match std::env::var("PROXY_URL").ok().filter(|s| !s.is_empty()) {
        Some(u) => mask_proxy_url(&u),
        None => "on (PROXY_URL not set)".to_string(),
    }
}

fn mask_proxy_url(url: &str) -> String {
    let url = url.trim();
    if let Some(after_scheme) = url.find("://") {
        let rest = &url[after_scheme + 3..];
        if let Some(at_pos) = rest.find('@') {
            let host_etc = &rest[at_pos + 1..];
            return format!("{}://***@{}", &url[..after_scheme + 3], host_etc);
        }
        return url.to_string();
    }
    "***".to_string()
}

/// 从环境变量 `PROXY_ENABLED` / `PROXY_URL` 读取代理配置。
///
/// - `PROXY_ENABLED=true` + `PROXY_URL=http://...` → 返回 `Some(Proxy)`
/// - 本地地址（localhost / 127.0.0.1 / 0.0.0.0 / ::1）自动排除，不走代理
/// - 其余情况返回 `None`
pub fn proxy_from_env() -> Option<reqwest::Proxy> {
    let enabled = std::env::var("PROXY_ENABLED")
        .map(|v| matches!(v.to_lowercase().as_str(), "true" | "1" | "yes"))
        .unwrap_or(false);
    if !enabled {
        return None;
    }

    let url = match std::env::var("PROXY_URL").ok().filter(|s| !s.is_empty()) {
        Some(u) => u,
        None => {
            tracing::warn!("PROXY_ENABLED=true but PROXY_URL not set, proxy disabled");
            return None;
        }
    };

    // Proxy::custom 允许按请求目标地址决定是否走代理
    // 本地服务（Ollama 等）不走代理，外部 Provider（OpenAI / Anthropic 等）走代理
    let proxy = reqwest::Proxy::custom(move |req_url| {
        let host = req_url.host_str().unwrap_or("");
        if host == "localhost"
            || host == "127.0.0.1"
            || host == "0.0.0.0"
            || host == "::1"
            || host.starts_with("192.168.")
            || host.starts_with("10.")
        {
            None
        } else {
            Some(url.clone())
        }
    });

    tracing::info!("HTTP proxy enabled for external providers");
    Some(proxy)
}

// ─── AppConfig ────────────────────────────────────────────────────────────────

/// 全局应用配置（只读，线程间共享）
pub struct AppConfig {
    /// 各 AI Provider 的连接配置
    pub providers: ProviderConfig,
    /// API Key 元数据在 Redis 中的缓存 TTL（秒）
    pub key_cache_ttl_secs: u64,
}

impl AppConfig {
    pub fn from_env() -> Self {
        Self::from_env_with_toml(None)
    }

    /// 使用 TOML 配置作为默认值（环境变量仍可覆盖）。
    pub fn from_env_with_toml(toml: Option<&GatewayTomlConfig>) -> Self {
        let key_ttl = std::env::var("KEY_CACHE_TTL_SECS")
            .ok().and_then(|v| v.parse().ok())
            .unwrap_or_else(|| toml.map(|t| t.cache.key_ttl_secs).unwrap_or(1800));
        Self {
            providers: ProviderConfig::from_env_with_toml(toml.map(|t| &t.providers)),
            key_cache_ttl_secs: key_ttl,
        }
    }

    /// 获取指定 Provider 类型的 API Key
    pub fn api_key_for(&self, provider: &ProviderType) -> Option<&str> {
        match provider {
            ProviderType::OpenAI | ProviderType::Unknown => {
                self.providers.openai_api_key.as_deref()
            }
            ProviderType::Anthropic => self.providers.anthropic_api_key.as_deref(),
            ProviderType::Google    => self.providers.google_api_key.as_deref(),
            ProviderType::Together => self.providers.together_api_key.as_deref(),
            ProviderType::Ollama => self.providers.ollama_api_key.as_deref(),
        }
    }

    /// 获取指定 Provider 的 Base URL
    #[allow(dead_code)]
    pub fn base_url_for(&self, provider: &ProviderType) -> &str {
        match provider {
            ProviderType::OpenAI | ProviderType::Unknown => &self.providers.openai_base_url,
            ProviderType::Anthropic => &self.providers.anthropic_base_url,
            ProviderType::Google    => &self.providers.google_base_url,
            ProviderType::Together => &self.providers.together_base_url,
            ProviderType::Ollama => &self.providers.ollama_base_url,
        }
    }

    /// 格式化为启动日志展示（API Key 仅显示是否已配置，不输出明文）。
    pub fn format_for_startup_display(&self) -> Vec<String> {
        let p = &self.providers;
        let key = |o: &Option<String>| if o.as_ref().map_or(false, |s| !s.is_empty()) { "set" } else { "–" };
        let lines = vec![
            format!("cache.key_ttl_secs={}  provider.timeout_secs={}  provider.pool_max_idle={}", self.key_cache_ttl_secs, p.timeout_secs, p.pool_max_idle),
            format!("  openai    {}  key={}", p.openai_base_url, key(&p.openai_api_key)),
            format!("  anthropic {}  key={}", p.anthropic_base_url, key(&p.anthropic_api_key)),
            format!("  google    {}  key={}", p.google_base_url, key(&p.google_api_key)),
            format!("  together  {}  key={}", p.together_base_url, key(&p.together_api_key)),
            format!("  ollama    {}  key={}", p.ollama_base_url, key(&p.ollama_api_key)),
        ];
        lines
    }
}
