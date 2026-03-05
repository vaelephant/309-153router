//! `/v1/chat/completions` API 处理器（纯流程编排）
//!
//! 本文件**只做编排**，不含 Provider 细节、流处理实现或 SQL 语句：
//!
//! ```text
//! authenticate → get_model_pricing → model_router.route
//!     ↓ 非流式                   ↓ 流式
//! call_with_fallback           call_with_fallback
//! convert_response             TextOnlyStream → 只输出生成文字（纯文本流）
//! bill_in_tx                   tokio::spawn → bill_in_tx
//! return JSON                  return text/plain
//! ```

use std::time::Instant;

use axum::{body::Body, extract::State, http::HeaderMap, response::Response, Json};
use futures::StreamExt;
use http::StatusCode;
use tracing::{error, info, warn};

use crate::{
    db::{self, ApiKeyMeta, BillArgs, ModelPricingInfo, cache_get_key_meta, cache_set_key_meta},
    error::{AppError, AppResult},
    metrics::compute_cost,
    middleware::auth::{extract_bearer, sha256_hex},
    protocol::{ChatCompletionRequest, ChatCompletionResponse},
    providers::build_provider,
    proxy::{StreamUsage, TextOnlyStream, TrailerFn},
    router::{RouteInfo, RouterState},
};

// ─── 公开 Handler ─────────────────────────────────────────────────────────────

pub async fn chat_completions(
    State(state): State<RouterState>,
    headers: HeaderMap,
    Json(request): Json<ChatCompletionRequest>,
) -> AppResult<Response> {
    let start = Instant::now();

    // [临时调试] 打印 Authorization 前10位 和 model
    let auth_prefix = headers
        .get("authorization")
        .and_then(|v| v.to_str().ok())
        .map(|s| &s[..s.len().min(10)])
        .unwrap_or("(none)");
    tracing::info!("[DEBUG] auth_prefix={:?} model={} stream={}", auth_prefix, request.model, request.stream);

    // 强制非流式：OpenClaw 无法解析 SSE，统一走非流式 JSON
    let mut request = request;
    request.stream = false;
    // 过滤 tool/function 消息，避免 OpenAI 报 400
    request = request.strip_tool_messages();

    let meta = authenticate(&state, &headers).await?;

    if request.model.is_empty() {
        return Err(AppError::BadRequest("model is required".into()));
    }
    if request.messages.is_empty() {
        return Err(AppError::BadRequest("messages cannot be empty".into()));
    }

    let pricing = db::get_model_pricing(&state.db, &request.model)
        .await?
        .ok_or_else(|| AppError::BadRequest(format!("model '{}' is not available", request.model)))?;

    let route = state.model_router.route(&request.model).await;
    info!(model = %request.model, provider = ?route.provider, stream = request.stream, "routing");

    if request.stream {
        handle_stream(state, request, route, meta, pricing, start).await
    } else {
        handle_non_stream(state, request, route, meta, pricing, start).await
    }
}

// ─── 非流式 ───────────────────────────────────────────────────────────────────

async fn handle_non_stream(
    state: RouterState, request: ChatCompletionRequest, route: RouteInfo,
    meta: ApiKeyMeta, pricing: ModelPricingInfo, start: Instant,
) -> AppResult<Response> {
    let resp = call_with_fallback(&state, &request, &route, false).await?;
    if !resp.status().is_success() {
        let status = resp.status();
        let body   = resp.text().await.unwrap_or_default();
        return Err(AppError::Upstream(format!("upstream {status}: {body}")));
    }

    let upstream_json: serde_json::Value = resp.json().await.map_err(AppError::HttpRequest)?;
    let provider  = build_provider(&route.provider, "", &route.provider_url);
    let chat_resp: ChatCompletionResponse = provider.convert_response(&request.model, &upstream_json);

    let mut latency_ms_header = String::new();
    let mut cost_yuan_header  = String::new();

    if let Some(ref usage) = chat_resp.usage {
        let cost    = compute_cost(usage.prompt_tokens as i32, usage.completion_tokens as i32, &pricing);
        let latency = start.elapsed().as_millis();

        // 存到响应头，不放进 JSON body（避免 OpenClaw 等严格解析器报 unknown field）
        latency_ms_header = latency.to_string();
        cost_yuan_header  = cost.to_string();

        // 异步扣费：不阻塞响应，先把结果返回给调用方
        let db_clone  = state.db.clone();
        let bill_args = BillArgs {
            user_id:       meta.user_id,
            api_key_id:    meta.api_key_id,
            model:         request.model.clone(),
            input_tokens:  usage.prompt_tokens as i32,
            output_tokens: usage.completion_tokens as i32,
            total_tokens:  usage.total_tokens as i32,
            cost,
            latency_ms:    latency as i32,
        };
        tokio::spawn(async move {
            if let Err(e) = db::bill_in_tx(&db_clone, bill_args).await {
                error!(err = %e, "non-stream billing failed");
            }
        });
    }

    // chat_resp 里不再设置 model_latency_ms / cost_yuan，保持严格 OpenAI 格式
    let body = serde_json::to_string(&chat_resp)?;

    // [临时调试] 打印返回给调用方的完整信息
    {
        let content_preview = chat_resp.choices.first()
            .map(|c| {
                let t = c.message.content.chars().take(40).collect::<String>();
                format!("string({} chars): {:?}", c.message.content.len(), t)
            })
            .unwrap_or_else(|| "choices is empty!".into());
        let finish_reason = chat_resp.choices.first()
            .map(|c| c.finish_reason.as_str())
            .unwrap_or("N/A");
        let has_error = body.contains("\"error\"");
        info!(
            "[DEBUG RESP] status=200 \
             Content-Type=application/json \
             X-Model-Latency-Ms={} \
             X-Cost-Yuan={} \
             body_len={} \
             content={} \
             finish_reason={} \
             has_error_field={}",
            latency_ms_header, cost_yuan_header,
            body.len(), content_preview, finish_reason, has_error
        );
    }

    Ok(Response::builder()
        .status(StatusCode::OK)
        .header("Content-Type", "application/json")
        .header("X-Model-Latency-Ms", latency_ms_header)
        .header("X-Cost-Yuan", cost_yuan_header)
        .body(Body::from(body))
        .unwrap())
}

// ─── 流式 ─────────────────────────────────────────────────────────────────────

async fn handle_stream(
    state: RouterState, request: ChatCompletionRequest, route: RouteInfo,
    meta: ApiKeyMeta, pricing: ModelPricingInfo, start: Instant,
) -> AppResult<Response> {
    let upstream = call_with_fallback(&state, &request, &route, true).await?;
    if !upstream.status().is_success() {
        return Err(AppError::Upstream(format!("upstream stream error: {}", upstream.status())));
    }

    let (usage_tx, usage_rx) = tokio::sync::oneshot::channel::<Option<StreamUsage>>();
    let raw_stream = upstream.bytes_stream().map(|r: Result<bytes::Bytes, reqwest::Error>| {
        r.map(|b| b.to_vec()).map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e))
    });
    let start = start;
    // trailer 不再追加到流末尾（避免干扰 OpenClaw 等 SSE 解析器）
    let trailer_fn: TrailerFn = None;
    let body_stream = Body::from_stream(TextOnlyStream::new(Box::pin(raw_stream), usage_tx, trailer_fn));

    let db_clone   = state.db.clone();
    let model_name = request.model.clone();
    let user_id    = meta.user_id;
    let key_id     = meta.api_key_id;

    tokio::spawn(async move {
        match usage_rx.await {
            Ok(Some(usage)) => {
                let cost = compute_cost(usage.prompt_tokens, usage.completion_tokens, &pricing);
                if let Err(e) = db::bill_in_tx(&db_clone, BillArgs {
                    user_id, api_key_id: key_id, model: model_name.clone(),
                    input_tokens:  usage.prompt_tokens,
                    output_tokens: usage.completion_tokens,
                    total_tokens:  usage.prompt_tokens + usage.completion_tokens,
                    cost, latency_ms: start.elapsed().as_millis() as i32,
                }).await {
                    error!(model = %model_name, err = %e, "stream billing failed");
                }
            }
            Ok(None) => warn!(model = %model_name, "stream ended without usage data"),
            Err(_)   => warn!(model = %model_name, "billing channel dropped"),
        }
    });

    Ok(Response::builder()
        .status(StatusCode::OK)
        .header("Content-Type", "text/plain; charset=utf-8")
        .header("Cache-Control", "no-cache")
        .header("X-Accel-Buffering", "no")
        .body(body_stream)
        .unwrap())
}

// ─── Provider 调用（含 Fallback）────────────────────────────────────────────

async fn call_with_fallback(
    state: &RouterState, request: &ChatCompletionRequest,
    route: &RouteInfo, stream: bool,
) -> AppResult<reqwest::Response> {
    let api_key  = state.config.api_key_for(&route.provider)
        .ok_or_else(|| AppError::Internal(format!("{:?} API key not configured", route.provider)))?;
    let provider = build_provider(&route.provider, api_key, &route.provider_url);

    let result = provider.call(&state.http_client, request, stream).await;

    let needs_fallback = match &result {
        Ok(resp) if resp.status().is_success() => return result,
        _ => has_fallback(route),
    };

    if needs_fallback {
        let fb_model   = route.fallback_model.as_deref().unwrap();
        let fb_url     = route.fallback_provider_url.as_deref().unwrap();
        let fb_ptype   = route.fallback_provider.as_ref().unwrap();
        let fb_api_key = state.config.api_key_for(fb_ptype)
            .ok_or_else(|| AppError::Internal(format!("{fb_ptype:?} fallback API key not configured")))?;

        warn!(primary = %route.model, fallback = %fb_model, "retrying with fallback");
        let mut fb_req = request.clone();
        fb_req.model = fb_model.to_string();
        build_provider(fb_ptype, fb_api_key, fb_url)
            .call(&state.http_client, &fb_req, stream).await
    } else {
        result
    }
}

fn has_fallback(route: &RouteInfo) -> bool {
    route.fallback_model.is_some()
        && route.fallback_provider_url.is_some()
        && route.fallback_provider.is_some()
}

// ─── 认证 ─────────────────────────────────────────────────────────────────────

async fn authenticate(state: &RouterState, headers: &HeaderMap) -> AppResult<ApiKeyMeta> {
    let api_key  = extract_bearer(headers)
        .ok_or_else(|| AppError::Authentication("Missing API key".into()))?;
    let key_hash = sha256_hex(&api_key);

    let mut redis = state.redis.clone();
    let meta = if let Some(cached) = cache_get_key_meta(&mut redis, &key_hash).await {
        cached
    } else {
        let from_db = db::validate_key_from_db(&state.db, &key_hash).await?
            .ok_or_else(|| AppError::Authentication("Invalid API key".into()))?;
        let ttl = state.config.key_cache_ttl_secs;
        cache_set_key_meta(&mut redis, &key_hash, &from_db, ttl).await;
        from_db
    };

    if meta.status != "active" {
        return Err(AppError::Authorization(format!("API key is '{}'", meta.status)));
    }
    Ok(meta)
}

// ─── 调试接口 /debug/echo ─────────────────────────────────────────────────────
// 返回固定 OpenAI 格式 JSON，用于验证 OpenClaw 能否正常解析响应
// 验证完成后可删除此接口和 main.rs 里对应的路由注册

pub async fn debug_echo() -> Response {
    let body = r#"{"id":"debug-echo","object":"chat.completion","created":0,"model":"gpt-4o","choices":[{"index":0,"message":{"role":"assistant","content":"echo ok"},"finish_reason":"stop"}],"usage":{"prompt_tokens":0,"completion_tokens":0,"total_tokens":0}}"#;
    Response::builder()
        .status(StatusCode::OK)
        .header("Content-Type", "application/json")
        .body(Body::from(body))
        .unwrap()
}
