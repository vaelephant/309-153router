//! Redis 缓存操作
//!
//! 只负责 API Key 元数据的缓存读写，不包含任何 Postgres 逻辑。
//!
//! # Key 格式
//! ```text
//! ak:<sha256_hex(raw_api_key)>
//! ```
//!
//! # 缓存生命周期
//!
//! ```text
//! 写入：validate_key_from_db 成功后，TTL = KEY_CACHE_TTL_SECS（默认 1800s）
//! 失效：
//!   a. TTL 自然过期
//!   b. Next.js 吊销 Key 时调用 cache_del_key_meta（即时失效）
//! ```
//!
//! # 错误策略
//! Redis 操作失败**静默降级**（只打 warn 日志），不向上传播错误。
//! 原因：缓存层故障不应中断核心业务逻辑，只是性能降级（多查一次 DB）。

use bigdecimal::BigDecimal;
use redis::{aio::ConnectionManager, AsyncCommands};
use uuid::Uuid;

use super::types::ApiKeyMeta;
use crate::router::SessionSummary;

fn cache_key(key_hash: &str) -> String {
    format!("ak:{key_hash}")
}

fn session_key(session_id: Uuid) -> String {
    format!("sess:{session_id}")
}

/// 获取会话摘要
pub async fn get_session_summary(
    redis: &mut ConnectionManager,
    session_id: Uuid,
) -> Option<SessionSummary> {
    let skey = session_key(session_id);
    let raw: Option<String> = redis.get(&skey).await.ok().flatten();
    serde_json::from_str(&raw?).ok()
}

/// 保存会话摘要 (TTL 1小时)
pub async fn set_session_summary(
    redis: &mut ConnectionManager,
    summary: &SessionSummary,
) {
    let skey = session_key(summary.session_id);
    if let Ok(json) = serde_json::to_string(summary) {
        let _: redis::RedisResult<()> = redis.set_ex(&skey, json, 3600).await;
    }
}

/// 从 Redis 读取 Key 元数据。
///
/// 返回 `None`：缓存未命中（需要回源查 DB）或 Redis 故障（静默降级）。
pub async fn cache_get_key_meta(
    redis:    &mut ConnectionManager,
    key_hash: &str,
) -> Option<ApiKeyMeta> {
    let rkey = cache_key(key_hash);
    let raw: Option<String> = redis.get(&rkey).await.ok()?;
    serde_json::from_str(&raw?).ok()
}

/// 将 Key 元数据写入 Redis，设置过期时间。
///
/// 写入失败只打 warn，不影响请求处理。
pub async fn cache_set_key_meta(
    redis:    &mut ConnectionManager,
    key_hash: &str,
    meta:     &ApiKeyMeta,
    ttl_secs: u64,
) {
    let rkey = cache_key(key_hash);
    match serde_json::to_string(meta) {
        Ok(json) => {
            let result: redis::RedisResult<()> = redis.set_ex(&rkey, json, ttl_secs).await;
            if let Err(e) = result {
                tracing::warn!(key_hash = %key_hash, err = %e, "redis set_ex failed");
            }
        }
        Err(e) => tracing::warn!(err = %e, "failed to serialize ApiKeyMeta for cache"),
    }
}

// ─── 用户余额缓存 ──────────────────────────────────────────────────────────────
//
// Key 格式: `bal:<user_id_uuid>`
// TTL: 由调用方传入（推荐 30s）
//
// 逻辑：
//   读取时先查缓存，未命中才查 DB 并回填；
//   扣费成功后立即删除缓存，下次请求强制刷新，避免预检误判余额充足。

fn balance_key(user_id: Uuid) -> String {
    format!("bal:{user_id}")
}

/// 读取缓存的用户余额。未命中或 Redis 故障时返回 None（调用方回源 DB）。
pub async fn cache_get_balance(redis: &mut ConnectionManager, user_id: Uuid) -> Option<BigDecimal> {
    let key = balance_key(user_id);
    let s: Option<String> = redis.get(&key).await.ok()?;
    s?.parse::<BigDecimal>().ok()
}

/// 将用户余额写入 Redis 缓存，失败静默降级。
pub async fn cache_set_balance(
    redis: &mut ConnectionManager,
    user_id: Uuid,
    balance: &BigDecimal,
    ttl_secs: u64,
) {
    let key = balance_key(user_id);
    let result: redis::RedisResult<()> = redis.set_ex(&key, balance.to_string(), ttl_secs).await;
    if let Err(e) = result {
        tracing::warn!(err = %e, "cache_set_balance failed");
    }
}

/// 扣费成功后立即使余额缓存失效，迫使下次请求从 DB 刷新真实余额。
pub async fn cache_del_balance(redis: &mut ConnectionManager, user_id: Uuid) {
    let key = balance_key(user_id);
    let _: redis::RedisResult<()> = redis.del(&key).await;
}

/// 立即从 Redis 删除指定 Key 的缓存（吊销时调用）。
///
/// 由 Next.js 控制台在撤销 API Key 时触发（通过内部 API 调用此逻辑），
/// 使缓存立即失效，无需等待 TTL 自然过期。
#[allow(dead_code)]
pub async fn cache_del_key_meta(redis: &mut ConnectionManager, key_hash: &str) {
    let rkey = cache_key(key_hash);
    let result: redis::RedisResult<()> = redis.del(&rkey).await;
    if let Err(e) = result {
        tracing::warn!(key_hash = %key_hash, err = %e, "redis del failed");
    }
}
