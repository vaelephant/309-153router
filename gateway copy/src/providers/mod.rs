//! AI Provider 抽象层
//!
//! 每个 Provider 实现 [`Provider`] trait，handler 只依赖这个 trait。
//!
//! # 添加新 Provider（3 步）
//!
//! 1. 新建 `providers/your_provider.rs`，实现 `Provider` trait
//! 2. 在 `build_provider()` 里增加一个 match 分支
//! 3. 在 `router/registry.rs` 的路由表里登记对应模型

use async_trait::async_trait;
use serde_json::Value;

use crate::{
    error::AppResult,
    protocol::{ChatCompletionRequest, ChatCompletionResponse},
    router::ProviderType,
};

pub mod anthropic;
pub mod google;
pub mod openai;

// ─── Provider Trait ───────────────────────────────────────────────────────────

/// 所有 AI Provider 必须实现的接口
#[async_trait]
pub trait Provider: Send + Sync {
    /// 调用 Provider，返回原始 HTTP 响应。
    /// `stream = true` → 响应体为 SSE 流；`false` → 完整 JSON
    async fn call(
        &self,
        client:  &reqwest::Client,
        request: &ChatCompletionRequest,
        stream:  bool,
    ) -> AppResult<reqwest::Response>;

    /// 将 Provider 原生响应 JSON 转换为 OpenAI 兼容格式（仅非流式使用）
    fn convert_response(&self, model: &str, body: &Value) -> ChatCompletionResponse;
}

// ─── Provider 工厂 ────────────────────────────────────────────────────────────

/// 根据 ProviderType 和 API Key 构造 Provider 实例
pub fn build_provider(
    provider_type: &ProviderType,
    api_key:       &str,
    provider_url:  &str,
) -> Box<dyn Provider> {
    match provider_type {
        ProviderType::Anthropic => {
            Box::new(anthropic::AnthropicProvider::new(api_key))
        }
        ProviderType::Google => {
            Box::new(google::GoogleProvider::new(api_key))
        }
        ProviderType::OpenAI | ProviderType::Unknown => {
            Box::new(openai::OpenAIProvider::new(api_key, provider_url))
        }
    }
}
