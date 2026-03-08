//! 代理层
//!
//! 负责 AI Provider 响应到客户端的字节流转发，
//! 以及在透传过程中截取 token 用量。

pub mod stream_proxy;

pub use stream_proxy::{AccountingStream, StreamUsage};

// ─── 出站代理工具 ─────────────────────────────────────────────────────────────

/// 根据环境变量 `PROXY_ENABLED` / `PROXY_URL` / `NO_PROXY` 构建 reqwest 代理。
///
/// `NO_PROXY` 格式：逗号分隔的主机名或 IP 前缀，例如：
///   `NO_PROXY=localhost,127.0.0.1,192.168.0.0/16`
///
/// 私有地址段（10.x / 172.16-31.x / 192.168.x）和 localhost / 127.x
/// 始终自动绕过代理，无需额外配置。
///
/// 返回 `None` 表示代理未启用或配置无效，调用方直接使用默认直连。
pub fn build_outbound_proxy() -> Option<reqwest::Proxy> {
    let proxy_enabled = std::env::var("PROXY_ENABLED")
        .map(|v| v.to_lowercase() == "true")
        .unwrap_or(false);

    if !proxy_enabled {
        return None;
    }

    let proxy_url = std::env::var("PROXY_URL").ok()?;

    // 读取 NO_PROXY 列表（逗号分隔）
    let no_proxy_list: Vec<String> = std::env::var("NO_PROXY")
        .or_else(|_| std::env::var("no_proxy"))
        .unwrap_or_default()
        .split(',')
        .map(|s| s.trim().to_lowercase())
        .filter(|s| !s.is_empty())
        .collect();

    let proxy_url_clone = proxy_url.clone();

    let proxy = reqwest::Proxy::custom(move |url| {
        let host = url.host_str().unwrap_or("").to_lowercase();
        // 始终绕过私有地址和 localhost
        if is_private_or_loopback(&host) {
            return None;
        }
        // 检查 NO_PROXY 列表
        for entry in &no_proxy_list {
            if host == *entry || host.ends_with(&format!(".{entry}")) {
                return None;
            }
        }
        proxy_url_clone.parse::<reqwest::Url>().ok()
    });

    tracing::info!("HTTP client proxy enabled: {}", proxy_url);
    Some(proxy)
}

/// 判断主机名是否属于私有/回环地址，这些地址应绕过代理直连。
fn is_private_or_loopback(host: &str) -> bool {
    if host == "localhost" {
        return true;
    }
    // 解析为 IPv4 地址
    if let Ok(ip) = host.parse::<std::net::Ipv4Addr>() {
        return ip.is_loopback()            // 127.x.x.x
            || ip.is_private()             // 10.x / 172.16-31.x / 192.168.x
            || ip.is_link_local();         // 169.254.x.x
    }
    if let Ok(ip) = host.parse::<std::net::Ipv6Addr>() {
        return ip.is_loopback();           // ::1
    }
    false
}
