//! GET /health/models — 各模型对应上游是否可访问及响应时间
//!
//! 按 Provider 探测上游 GET /models（或等价端点），将结果按模型展开返回，
//! 供管理端「模型状态」页使用。

use axum::{extract::State, response::IntoResponse, Json};
use serde::Serialize;

use crate::router::RouterState;
use crate::startup::healthcheck::{probe_all_providers_for_api, CheckStatus};

/// 单个模型在健康检查结果中的一项
#[derive(Serialize)]
pub struct ModelHealthItem {
    /// 模型 ID（如 gpt-4o、claude-3-5-sonnet）
    pub model:      String,
    /// 所属 Provider（如 openai、anthropic）
    pub provider:   String,
    /// 探测状态："ok" | "no_key" | "auth_failed" | "unreachable"
    pub status:     String,
    /// 上游响应延迟（毫秒）
    pub latency_ms: u64,
}

/// GET /health/models 的 JSON 响应体
#[derive(Serialize)]
pub struct HealthModelsResponse {
    /// 所有模型的健康项列表
    pub models: Vec<ModelHealthItem>,
}

/// 将 CheckStatus 枚举转为 API 返回用的字符串
fn status_to_string(s: &CheckStatus) -> String {
    match s {
        CheckStatus::Ok => "ok",
        CheckStatus::NoKey => "no_key",
        CheckStatus::AuthFailed(_) => "auth_failed",
        CheckStatus::Unreachable(_) => "unreachable",
    }
    .to_string()
}

/// GET /health/models 处理函数：按模型列出各上游可访问性与延迟
pub async fn health_models(State(state): State<RouterState>) -> impl IntoResponse {
    // 从路由表拿到「Provider -> 该 Provider 下的模型 ID 列表」
    let models_by_provider = state.model_router.models_by_provider().await;
    // 对所有 Provider 做一次探测（请求其 /models 或等价端点），得到状态与延迟
    let probe_results = probe_all_providers_for_api(state.config.clone()).await;

    // 构建 Provider -> (状态字符串, 延迟ms)，方便后面按 Provider 查
    let provider_map: std::collections::HashMap<String, (String, u64)> = probe_results
        .into_iter()
        .map(|r| (r.provider, (status_to_string(&r.status), r.latency_ms)))
        .collect();

    // 按「每个 Provider 下的每个模型」展开成 ModelHealthItem 列表
    let mut models = Vec::new();
    for (provider, model_ids) in models_by_provider {
        let (status, latency_ms) = provider_map
            .get(&provider)
            .cloned()
            .unwrap_or_else(|| ("unknown".to_string(), 0));
        for model in model_ids {
            models.push(ModelHealthItem {
                model,
                provider: provider.clone(),
                status: status.clone(),
                latency_ms,
            });
        }
    }
    // 按模型 ID 字母序排序，便于前端展示
    models.sort_by(|a, b| a.model.cmp(&b.model));

    Json(HealthModelsResponse { models })
}
