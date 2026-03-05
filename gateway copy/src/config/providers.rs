//! Provider 连接配置
//!
//! 每个 AI Provider 的：
//! - 平台 API Key（从环境变量读取）
//! - 默认 Base URL（可被路由表覆盖）
//! - 超时、连接池大小等

/// 所有 AI Provider 的连接配置
#[allow(dead_code)]
pub struct ProviderConfig {
    // ── OpenAI ──────────────────────────────────────────────────────────────
    /// 平台账号 API Key（env: OPENAI_API_KEY）
    pub openai_api_key:  Option<String>,
    /// Base URL，支持替换为兼容接口（Together / Groq 等）
    pub openai_base_url: String,

    // ── Anthropic ────────────────────────────────────────────────────────────
    /// 平台账号 API Key（env: ANTHROPIC_API_KEY）
    pub anthropic_api_key:  Option<String>,
    pub anthropic_base_url: String,

    // ── Google Gemini ────────────────────────────────────────────────────────
    /// 平台账号 API Key（env: GOOGLE_API_KEY）
    pub google_api_key:  Option<String>,
    pub google_base_url: String,

    // ── 网络参数 ─────────────────────────────────────────────────────────────
    /// 上游请求超时（秒），默认 120s（大模型生成慢）
    pub timeout_secs: u64,
    /// 每个 host 保留的最大空闲连接数（reqwest 连接池）
    pub pool_max_idle: usize,
}

impl ProviderConfig {
    /// 从环境变量加载，缺失的 Key 留 None（路由时按需报错）
    pub fn from_env() -> Self {
        Self {
            openai_api_key:   std::env::var("OPENAI_API_KEY").ok(),
            openai_base_url:  std::env::var("OPENAI_BASE_URL")
                .unwrap_or_else(|_| "https://api.openai.com/v1".into()),

            anthropic_api_key:   std::env::var("ANTHROPIC_API_KEY").ok(),
            anthropic_base_url:  std::env::var("ANTHROPIC_BASE_URL")
                .unwrap_or_else(|_| "https://api.anthropic.com".into()),

            google_api_key:   std::env::var("GOOGLE_API_KEY").ok(),
            google_base_url:  std::env::var("GOOGLE_BASE_URL")
                .unwrap_or_else(|_| "https://generativelanguage.googleapis.com/v1beta".into()),

            timeout_secs: std::env::var("PROVIDER_TIMEOUT_SECS")
                .ok()
                .and_then(|v| v.parse().ok())
                .unwrap_or(120),

            pool_max_idle: std::env::var("PROVIDER_POOL_MAX_IDLE")
                .ok()
                .and_then(|v| v.parse().ok())
                .unwrap_or(20),
        }
    }
}
