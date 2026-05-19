//! Prometheus 文本格式指标（轻量实现，无额外 exporter 依赖）

use std::sync::atomic::{AtomicU64, Ordering};

/// 全局计数器（进程内）
pub struct PrometheusMetrics {
    pub http_requests_total: AtomicU64,
    pub chat_requests_total: AtomicU64,
    pub chat_success_total: AtomicU64,
    pub chat_error_total: AtomicU64,
    pub chat_rate_limited_total: AtomicU64,
    pub chat_insufficient_balance_total: AtomicU64,
    pub chat_upstream_error_total: AtomicU64,
    pub stream_billing_estimated_total: AtomicU64,
}

impl PrometheusMetrics {
    const fn new() -> Self {
        Self {
            http_requests_total: AtomicU64::new(0),
            chat_requests_total: AtomicU64::new(0),
            chat_success_total: AtomicU64::new(0),
            chat_error_total: AtomicU64::new(0),
            chat_rate_limited_total: AtomicU64::new(0),
            chat_insufficient_balance_total: AtomicU64::new(0),
            chat_upstream_error_total: AtomicU64::new(0),
            stream_billing_estimated_total: AtomicU64::new(0),
        }
    }

    fn line(name: &str, help: &str, value: u64) -> String {
        format!(
            "# HELP {name} {help}\n# TYPE {name} counter\n{name} {value}\n",
            name = name,
            help = help,
            value = value
        )
    }

    pub fn render(&self) -> String {
        let mut out = String::new();
        out.push_str(&Self::line(
            "gateway_http_requests_total",
            "Total HTTP requests handled by the gateway",
            self.http_requests_total.load(Ordering::Relaxed),
        ));
        out.push_str(&Self::line(
            "gateway_chat_requests_total",
            "Total chat completion requests",
            self.chat_requests_total.load(Ordering::Relaxed),
        ));
        out.push_str(&Self::line(
            "gateway_chat_success_total",
            "Chat completions completed and billed successfully",
            self.chat_success_total.load(Ordering::Relaxed),
        ));
        out.push_str(&Self::line(
            "gateway_chat_error_total",
            "Chat completion errors (client or gateway)",
            self.chat_error_total.load(Ordering::Relaxed),
        ));
        out.push_str(&Self::line(
            "gateway_chat_rate_limited_total",
            "Chat requests rejected by rate limit or monthly quota",
            self.chat_rate_limited_total.load(Ordering::Relaxed),
        ));
        out.push_str(&Self::line(
            "gateway_chat_insufficient_balance_total",
            "Chat requests rejected due to insufficient balance",
            self.chat_insufficient_balance_total.load(Ordering::Relaxed),
        ));
        out.push_str(&Self::line(
            "gateway_chat_upstream_error_total",
            "Chat requests failed at upstream provider",
            self.chat_upstream_error_total.load(Ordering::Relaxed),
        ));
        out.push_str(&Self::line(
            "gateway_stream_billing_estimated_total",
            "Stream responses billed with estimated tokens (no upstream usage)",
            self.stream_billing_estimated_total.load(Ordering::Relaxed),
        ));
        out
    }
}

pub static PROMETHEUS: PrometheusMetrics = PrometheusMetrics::new();

pub fn inc_http_request() {
    PROMETHEUS.http_requests_total.fetch_add(1, Ordering::Relaxed);
}

pub fn inc_chat_request() {
    PROMETHEUS.chat_requests_total.fetch_add(1, Ordering::Relaxed);
}

pub fn record_chat_outcome(err: Option<&crate::error::AppError>) {
    match err {
        None => {
            PROMETHEUS.chat_success_total.fetch_add(1, Ordering::Relaxed);
        }
        Some(crate::error::AppError::RateLimited(_)) => {
            PROMETHEUS.chat_rate_limited_total.fetch_add(1, Ordering::Relaxed);
        }
        Some(crate::error::AppError::InsufficientBalance(_)) => {
            PROMETHEUS.chat_insufficient_balance_total.fetch_add(1, Ordering::Relaxed);
        }
        Some(crate::error::AppError::Upstream(_)) => {
            PROMETHEUS.chat_upstream_error_total.fetch_add(1, Ordering::Relaxed);
        }
        Some(_) => {
            PROMETHEUS.chat_error_total.fetch_add(1, Ordering::Relaxed);
        }
    }
}

pub fn inc_stream_billing_estimated() {
    PROMETHEUS
        .stream_billing_estimated_total
        .fetch_add(1, Ordering::Relaxed);
}
