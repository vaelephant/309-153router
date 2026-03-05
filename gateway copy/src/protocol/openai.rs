//! OpenAI 兼容协议结构体
//!
//! 本文件定义的是"**对外 API 协议**"——即网关暴露给用户的接口格式，
//! 与数据库实体（db/types.rs）完全分开。
//!
//! # 为什么放在 `protocol/` 而不是 `models/`？
//!
//! `models` 这个词在 Rust 项目中容易与"数据库模型"混淆。
//! `protocol/openai.rs` 明确表达："这是 OpenAI 兼容的 HTTP 协议数据结构"。
//!
//! # 支持的接口
//!
//! - `POST /v1/chat/completions`  → [`ChatCompletionRequest`] / [`ChatCompletionResponse`]
//! - `GET  /v1/models`            → [`ModelListResponse`]
//! - `GET  /v1/models/{m}/pricing`→ [`ModelPricingResponse`]
//! - `GET  /v1/usage`             → [`UsageStatsResponse`]

use serde::{Deserialize, Serialize};

// ─── 消息角色 ─────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum MessageRole {
    System,
    User,
    Assistant,
}

impl Default for MessageRole {
    fn default() -> Self { MessageRole::User }
}

// ─── 消息 ─────────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ChatMessage {
    pub role:    MessageRole,
    pub content: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name:    Option<String>,
}

// ─── Chat Completions 请求 ────────────────────────────────────────────────────

/// POST /v1/chat/completions 请求体（OpenAI 兼容）
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ChatCompletionRequest {
    /// 模型 ID（如 "gpt-4o", "claude-3-5-sonnet-20240620", "gemini-1.5-pro"）
    pub model:    String,
    pub messages: Vec<ChatMessage>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub temperature: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub top_p:       Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_tokens:  Option<u32>,

    /// true = SSE 流式；false = 同步 JSON
    #[serde(default)]
    pub stream: bool,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub stop:              Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub presence_penalty:  Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub frequency_penalty: Option<f32>,
}

// ─── Chat Completions 响应 ────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatCompletionResponse {
    pub id:      String,
    pub object:  String,
    pub created: u64,
    pub model:   String,
    pub choices: Vec<ChatChoice>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub usage:   Option<Usage>,
    /// 模型响应耗时（毫秒），非流式时返回
    #[serde(skip_serializing_if = "Option::is_none")]
    pub model_latency_ms: Option<u64>,
    /// 本次调用费用（元），与 usage 对应，非流式时返回
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cost_yuan: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatChoice {
    pub index:         u32,
    pub message:       ChatMessage,
    pub finish_reason: String,
}

/// Token 用量统计
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct Usage {
    pub prompt_tokens:     u32,
    pub completion_tokens: u32,
    pub total_tokens:      u32,
}

// ─── 模型列表 ─────────────────────────────────────────────────────────────────

/// GET /v1/models 单条模型信息
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelInfo {
    pub id:       String,
    pub object:   String,
    pub created:  u32,
    pub owned_by: String,
}

/// GET /v1/models 响应
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelListResponse {
    pub object: String,
    pub data:   Vec<ModelInfo>,
}

// ─── 模型定价 ─────────────────────────────────────────────────────────────────

/// GET /v1/models/:model/pricing 响应
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelPricingResponse {
    #[serde(rename = "modelName")]
    pub model_name:  String,
    /// 每 1K input tokens 的美元价格
    #[serde(rename = "inputCostPer1k")]
    pub input_cost:  f64,
    /// 每 1K output tokens 的美元价格
    #[serde(rename = "outputCostPer1k")]
    pub output_cost: f64,
    pub provider:    String,
}

// ─── 用量统计 ─────────────────────────────────────────────────────────────────

/// GET /v1/usage 响应
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsageStatsResponse {
    #[serde(rename = "userId")]
    pub user_id:      String,
    #[serde(rename = "totalTokens")]
    pub total_tokens: u64,
    /// 本周期累计消费（美元）
    pub cost:         f64,
    pub requests:     u64,
}
