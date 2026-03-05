//! OpenRouter Gateway — 库入口
//!
//! # 模块结构
//!
//! ```text
//! api/         HTTP 路由处理器（纯流程编排）
//! config/      全局配置（AppConfig + ProviderConfig）
//! db/          数据库访问层
//!   ├─ pg.rs       Postgres：Key 验证、原子扣费、定价查询
//!   ├─ redis.rs    Redis：Key 元数据缓存
//!   └─ types.rs    领域类型：ApiKeyMeta、BillArgs、ModelPricingInfo
//! error        统一错误类型（AppError / AppResult）
//! metrics/     指标与计量（compute_cost，BigDecimal 精度）
//! middleware/  工具函数（extract_bearer、sha256_hex）
//! protocol/    对外 API 协议结构（OpenAI 兼容格式）
//! providers/   AI Provider 实现（OpenAI / Anthropic / Google）
//! proxy/       代理层（AccountingStream：SSE 透传 + usage 截取）
//! router/      路由层
//!   ├─ model_router.rs  ProviderType、RouteInfo、ModelRouter
//!   └─ registry.rs      静态模型注册表（MVP）
//! ```

pub mod api;
pub mod config;
pub mod db;
pub mod error;
pub mod metrics;
pub mod middleware;
pub mod protocol;
pub mod providers;
pub mod proxy;
pub mod router;

pub use error::{AppError, AppResult};
