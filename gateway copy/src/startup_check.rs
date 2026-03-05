//! 启动时自检：各上游 AI Provider 的联通情况 + 本机 API 是否可访问
//!
//! - 上游：对每个 Provider Base URL 做 HEAD 请求；失败可配置 `GATEWAY_STARTUP_CHECK_EXIT_ON_FAIL=1` 退出。
//! - API：服务监听后对本机 `GET /health` 做若干次重试，确认 API 已联通。

use std::sync::Arc;
use std::time::Duration;

use tracing::{info, warn};

use crate::config::AppConfig;

/// 自检超时（单次请求）
const CHECK_TIMEOUT_SECS: u64 = 5;

/// API 自检：重试次数、间隔、单次超时
const API_CHECK_RETRIES: u32 = 5;
const API_CHECK_INTERVAL_SECS: u64 = 1;
const API_CHECK_TIMEOUT_SECS: u64 = 2;

/// 上游名称，用于日志
const OPENAI_NAME: &str = "OpenAI";
const ANTHROPIC_NAME: &str = "Anthropic";
const GOOGLE_NAME: &str = "Google";

/// 对配置中的各上游 Base URL 做联通检查；失败仅打日志，除非设置了
/// `GATEWAY_STARTUP_CHECK_EXIT_ON_FAIL=1` 则任一失败会 `std::process::exit(1)`。
pub async fn check_upstreams(config: Arc<AppConfig>) {
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(CHECK_TIMEOUT_SECS))
        .build()
        .unwrap_or_else(|e| {
            tracing::error!("Failed to build HTTP client for startup check: {e}");
            std::process::exit(1);
        });

    let mut all_ok = true;

    let checks = [
        (OPENAI_NAME, config.providers.openai_base_url.as_str()),
        (ANTHROPIC_NAME, config.providers.anthropic_base_url.as_str()),
        (GOOGLE_NAME, config.providers.google_base_url.as_str()),
    ];

    for (name, url) in checks {
        match check_one(&client, name, url).await {
            Ok(()) => info!(upstream = name, url = %url, "upstream reachable"),
            Err(e) => {
                warn!(upstream = name, url = %url, error = %e, "upstream unreachable");
                all_ok = false;
            }
        }
    }

    let exit_on_fail = std::env::var("GATEWAY_STARTUP_CHECK_EXIT_ON_FAIL")
        .ok()
        .and_then(|v| match v.as_str() {
            "1" | "true" | "yes" => Some(true),
            _ => Some(false),
        })
        .unwrap_or(false);

    if !all_ok && exit_on_fail {
        tracing::error!("Startup check failed (GATEWAY_STARTUP_CHECK_EXIT_ON_FAIL=1), exiting");
        std::process::exit(1);
    }
}

/// 对单个 Base URL 做 HEAD 请求；能拿到任意 HTTP 响应即视为联通。
async fn check_one(client: &reqwest::Client, _name: &str, base_url: &str) -> Result<(), String> {
    let url = base_url.trim_end_matches('/');
    client
        .head(url)
        .send()
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

/// 服务已监听后，对本机 GET /health 做联通检查（带重试）。
/// 用于确认 API 已真正可对外服务。
pub async fn check_api_reachable(port: u16) {
    let url = format!("http://127.0.0.1:{port}/health");
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(API_CHECK_TIMEOUT_SECS))
        .build()
        .unwrap_or_else(|e| {
            tracing::error!("Failed to build HTTP client for API check: {e}");
            std::process::exit(1);
        });

    for attempt in 1..=API_CHECK_RETRIES {
        match client.get(&url).send().await {
            Ok(resp) if resp.status().is_success() => {
                info!(url = %url, "API reachable");
                return;
            }
            Ok(resp) => {
                warn!(url = %url, status = %resp.status(), attempt, "API returned non-OK");
            }
            Err(e) => {
                warn!(url = %url, error = %e, attempt, "API unreachable");
            }
        }
        if attempt < API_CHECK_RETRIES {
            tokio::time::sleep(Duration::from_secs(API_CHECK_INTERVAL_SECS)).await;
        }
    }

    tracing::error!(url = %url, "API self-check failed after {} attempts", API_CHECK_RETRIES);
    std::process::exit(1);
}
