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

use axum::{body::Body, extract::State, http::HeaderMap, http::StatusCode, response::Response, Json};
use futures::StreamExt;
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

    // 余额预检：要求 balance >= estimated_cost，避免透支（企业级）
    let max_tokens = request.max_tokens.unwrap_or(4096) as i32;
    let k = bigdecimal::BigDecimal::from(1000i32);
    let estimated_output = bigdecimal::BigDecimal::from(max_tokens) / &k * &pricing.output_price;
    let estimated_input  = bigdecimal::BigDecimal::from(500i32) / &k * &pricing.input_price; // 粗估 500 input
    let estimated_cost  = estimated_input + estimated_output;
    let balance = db::get_user_balance(&state.db, meta.user_id).await?;
    if balance < estimated_cost {
        return Err(AppError::InsufficientBalance(
            "余额不足，请充值".to_string(),
        ));
    }

    if request.stream {
        handle_stream(state, request, route, meta, pricing, start).await
    } else {
        handle_non_stream(state, request, route, meta, pricing, start).await
    }
}

// ─── 非流式 ───────────────────────────────────────────────────────────────────

async fn handle_non_stream(
    state: RouterState, request: ChatCompletionRequest, route: RouteInfo,
    meta: ApiKeyMeta, _pricing: ModelPricingInfo, start: Instant,
) -> AppResult<Response> {
    let (resp, actual_model, actual_provider) = call_with_fallback(&state, &request, &route, false).await?;
    if !resp.status().is_success() {
        let status = resp.status();
        let body   = resp.text().await.unwrap_or_default();
        return Err(AppError::Upstream(format!("upstream {status}: {body}")));
    }

    let upstream_json: serde_json::Value = resp.json().await.map_err(AppError::HttpRequest)?;
    let provider  = build_provider(&route.provider, "", &route.provider_url);
    let mut chat_resp: ChatCompletionResponse = provider.convert_response(&request.model, &upstream_json);

    if let Some(ref usage) = chat_resp.usage {
        // 按实际调用的模型计费（OpenRouter 模式）
        let pricing_actual = db::get_model_pricing(&state.db, &actual_model).await.ok().flatten()
            .unwrap_or(_pricing);
        let cost = compute_cost(usage.prompt_tokens as i32, usage.completion_tokens as i32, &pricing_actual);
        db::bill_in_tx(&state.db, BillArgs {
            user_id:       meta.user_id,
            api_key_id:    meta.api_key_id,
            model:         &actual_model,
            requested_model: if actual_model != request.model { Some(request.model.as_str()) } else { None },
            provider:     Some(actual_provider.as_str()),
            request_id:   None,
            input_tokens:  usage.prompt_tokens as i32,
            output_tokens: usage.completion_tokens as i32,
            total_tokens:  usage.total_tokens as i32,
            cost: cost.clone(),
            latency_ms: start.elapsed().as_millis() as i32,
        }).await?;
        chat_resp.model_latency_ms = Some(start.elapsed().as_millis() as u64);
        chat_resp.cost_yuan = Some(cost.to_string());
    }

    let body = serde_json::to_string(&chat_resp)?;
    Ok(Response::builder()
        .status(StatusCode::OK)
        .header("Content-Type", "application/json")
        .body(Body::from(body))
        .unwrap())
}

// ─── 流式 ─────────────────────────────────────────────────────────────────────

async fn handle_stream(
    state: RouterState, request: ChatCompletionRequest, route: RouteInfo,
    meta: ApiKeyMeta, _pricing: ModelPricingInfo, start: Instant,
) -> AppResult<Response> {
    let (upstream, actual_model, actual_provider) = call_with_fallback(&state, &request, &route, true).await?;
    if !upstream.status().is_success() {
        return Err(AppError::Upstream(format!("upstream stream error: {}", upstream.status())));
    }

    // 按实际调用的模型取价（用于 trailer 与计费）
    let pricing_actual = db::get_model_pricing(&state.db, &actual_model).await.ok().flatten()
        .unwrap_or(_pricing);

    let (usage_tx, usage_rx) = tokio::sync::oneshot::channel::<Option<StreamUsage>>();
    let raw_stream = upstream.bytes_stream().map(|r: Result<bytes::Bytes, reqwest::Error>| {
        r.map(|b| b.to_vec()).map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e))
    });
    let start = start;
    let pricing_for_trailer = pricing_actual.clone();
    let trailer_fn: TrailerFn = Some(Box::new(move |u: StreamUsage| {
        let elapsed_ms = start.elapsed().as_millis();
        let cost = compute_cost(u.prompt_tokens, u.completion_tokens, &pricing_for_trailer);
        format!(
            "\n\n---\n生成时间: {} ms | prompt_tokens: {} | completion_tokens: {} | 费用: {} 元",
            elapsed_ms, u.prompt_tokens, u.completion_tokens, cost
        )
    }));
    let body_stream = Body::from_stream(TextOnlyStream::new(Box::pin(raw_stream), usage_tx, trailer_fn));

    let db_clone   = state.db.clone();
    let model_name = actual_model.clone();
    let requested  = request.model.clone();
    let prov_str   = actual_provider.as_str().to_string();
    let user_id    = meta.user_id;
    let key_id     = meta.api_key_id;
    let pricing_for_bill = pricing_actual;

    tokio::spawn(async move {
        match usage_rx.await {
            Ok(Some(usage)) => {
                let cost = compute_cost(usage.prompt_tokens, usage.completion_tokens, &pricing_for_bill);
                if let Err(e) = db::bill_in_tx(&db_clone, BillArgs {
                    user_id,
                    api_key_id: key_id,
                    model: &model_name,
                    requested_model: if model_name != requested { Some(requested.as_str()) } else { None },
                    provider: Some(prov_str.as_str()),
                    request_id: None,
                    input_tokens:  usage.prompt_tokens,
                    output_tokens: usage.completion_tokens,
                    total_tokens:  usage.prompt_tokens + usage.completion_tokens,
                    cost,
                    latency_ms: start.elapsed().as_millis() as i32,
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

/// 返回 (响应, 实际调用的模型, 实际调用的 Provider)。
/// Fallback 时 actual_model 为备用模型，便于按实际模型计费与记录。
async fn call_with_fallback(
    state: &RouterState, request: &ChatCompletionRequest,
    route: &RouteInfo, stream: bool,
) -> AppResult<(reqwest::Response, String, crate::router::ProviderType)> {
    let api_key  = state.config.api_key_for(&route.provider)
        .ok_or_else(|| AppError::Internal(format!("{:?} API key not configured", route.provider)))?;
    let provider = build_provider(&route.provider, api_key, &route.provider_url);

    let result = provider.call(&state.http_client, request, stream).await;

    let needs_fallback = match &result {
        Ok(resp) if resp.status().is_success() => {
            return result.map(|r| (r, route.model.clone(), route.provider.clone()));
        }
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
        let fb_resp = build_provider(fb_ptype, fb_api_key, fb_url)
            .call(&state.http_client, &fb_req, stream).await?;
        Ok((fb_resp, fb_model.to_string(), fb_ptype.clone()))
    } else {
        result.map(|r| (r, route.model.clone(), route.provider.clone()))
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
