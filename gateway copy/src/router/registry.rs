//! 静态模型注册表（MVP）
//!
//! 在服务启动时构建 `model → RouteInfo` 的映射，传给 [`ModelRouter`]。
//!
//! # MVP vs 企业级
//!
//! | 阶段 | 数据来源 | 更新方式 |
//! |------|----------|---------|
//! | MVP  | 代码中硬编码（本文件）| 重启服务 |
//! | 企业级 | Postgres `model_pricing` 表 | 定时拉取 / 管理员 API 触发热更新 |
//!
//! 后续迁移到数据库驱动时，只需修改 `build_default_registry()` 的实现，
//! 将 SQL 查询结果填充到 HashMap 中即可，调用方（`router/mod.rs`）无需变动。
//!
//! # 预留接口：policy.rs（TODO）
//!
//! 企业级功能（用户级别 allowlist、A/B 路由、地区路由）可以在 `router/policy.rs`
//! 中实现，`ModelRouter` 在 `route()` 前先查询 policy 层。

use std::collections::HashMap;

use super::model_router::{ProviderType, RouteInfo};

/// 构建默认模型注册表。
///
/// 返回的 HashMap 传给 `ModelRouter::new()`，之后通过 `RwLock` 保护，
/// 允许运行时追加或修改条目。
pub fn build_default_registry() -> HashMap<String, RouteInfo> {
    let mut map = HashMap::new();

    // ── OpenAI 模型 ──────────────────────────────────────────────────────────
    for model in [
        "gpt-4o",
        "gpt-4o-mini",
        "gpt-4-turbo",
        "gpt-4",
        "gpt-3.5-turbo",
        "o1-preview",
        "o1-mini",
    ] {
        map.insert(model.to_string(), RouteInfo {
            model:                model.to_string(),
            provider_url:         "https://api.openai.com/v1".into(),
            provider:             ProviderType::OpenAI,
            fallback_model:       None,
            fallback_provider_url: None,
            fallback_provider:    None,
        });
    }

    // ── Anthropic Claude 模型 ────────────────────────────────────────────────
    for model in [
        "claude-3-5-sonnet-20240620",
        "claude-3-5-haiku-20241022",
        "claude-3-opus-20240229",
        "claude-3-sonnet-20240229",
        "claude-3-haiku-20240307",
    ] {
        map.insert(model.to_string(), RouteInfo {
            model:                model.to_string(),
            provider_url:         "https://api.anthropic.com".into(),
            provider:             ProviderType::Anthropic,
            fallback_model:       None,
            fallback_provider_url: None,
            fallback_provider:    None,
        });
    }

    // ── Google Gemini 模型 ───────────────────────────────────────────────────
    for model in [
        "gemini-1.5-pro",
        "gemini-1.5-flash",
        "gemini-2.0-flash",
        "gemini-pro",
    ] {
        map.insert(model.to_string(), RouteInfo {
            model:                model.to_string(),
            provider_url:         "https://generativelanguage.googleapis.com/v1beta".into(),
            provider:             ProviderType::Google,
            fallback_model:       None,
            fallback_provider_url: None,
            fallback_provider:    None,
        });
    }

    // ── 示例 fallback 配置：gpt-4 失败时降级到 gpt-4o-mini ──────────────────
    // 生产环境建议从数据库加载 fallback 策略，而不是硬编码
    if let Some(route) = map.get_mut("gpt-4") {
        route.fallback_model        = Some("gpt-4o-mini".into());
        route.fallback_provider_url = Some("https://api.openai.com/v1".into());
        route.fallback_provider     = Some(ProviderType::OpenAI);
    }

    map
}
