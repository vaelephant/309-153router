//! Gateway 二进制入口
//!
//! 职责：初始化日志系统、加载 .env 环境变量、调用 `opt_router_gateway::run()` 完成所有启动流程。
//!
//! # 启动流程
//!
//! 1. 初始化日志系统（tracing_subscriber）
//!    - 从环境变量 `RUST_LOG` 读取日志级别，默认 `info,tower_http=warn,sqlx=error`
//!    - 支持按 crate 名称设置不同日志级别
//!
//! 2. 加载 .env 文件
//!    - 使用 dotenv 库读取项目根目录的 .env 文件
//!    - 配置数据库连接、Redis、API Keys 等
//!
//! 3. 调用 run() 启动服务
//!    - 连接 Postgres 和 Redis
//!    - 初始化模型路由表
//!    - 检查上游 AI Provider 连通性
//!    - 启动 HTTP 服务器监听端口

use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

/// 程序入口点
///
/// 使用 #[tokio::main] 标记为异步运行时入口
/// - 初始化 tokio 异步运行时
/// - 支持多任务并发执行
#[tokio::main]
async fn main() {
    // ─────────────────────────────────────────────────────────────────────────────
    // 1. 初始化日志系统
    // ─────────────────────────────────────────────────────────────────────────────
    //
    // tracing_subscriber 是 Rust 最常用的日志框架之一
    // 它支持结构化日志，性能优秀且与 async 代码兼容
    //
    // EnvFilter: 从环境变量 RUST_LOG 读取日志级别配置
    //   语法: crate_name=level,crate_name=level,...
    //   级别: trace < debug < info < warn < error
    //   示例: "info" 表示所有 crate 只记录 info 及以上级别
    //         "tower_http=warn,sqlx=error" 表示 tower_http 只记录 warn，sqlx 只记录 error
    //
    // 默认值 "info,tower_http=warn,sqlx=error" 的含义:
    //   - 大多数日志输出 info 级别（业务关键信息）
    //   - tower_http（HTTPS 服务器）只记录警告，避免大量连接日志
    //   - sqlx（数据库操作）只记录错误，避免大量查询日志
    
    tracing_subscriber::registry()
        .with(
            // try_from_default_env() 尝试从环境变量读取
            // 如果环境变量未设置或解析失败，使用默认值
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "info,tower_http=warn,sqlx=error".into()),
        )
        // fmt::layer() 添加日志格式化输出
        // 会将日志输出到 stdout，格式类似:
        // 2024-01-01T12:00:00Z INFO  main:xx - message
        .with(tracing_subscriber::fmt::layer())
        // init() 完成初始化，必须且只能调用一次
        // 调用后会设置全局日志 subscriber
        .init();

    // ─────────────────────────────────────────────────────────────────────────────
    // 2. 加载 .env 环境变量文件
    // ─────────────────────────────────────────────────────────────────────────────
    //
    // dotenv::dotenv() 会自动查找并加载项目根目录的 .env 文件
    // .env 文件格式: KEY=value，每行一个环境变量
    //
    // 示例 .env 文件内容:
    //   DATABASE_URL=postgres://user:pass@localhost:5432/mydb
    //   REDIS_URL=redis://localhost:6379
    //   OPENAI_API_KEY=sk-xxx
    //   PORT=9115
    //
    // .ok() 的作用:
    //   - 如果 .env 文件不存在或加载失败，.ok() 会忽略错误并继续执行
    //   - 这是因为环境变量也可以通过系统环境变量传入，不强制要求 .env 文件
    
    dotenv::dotenv().ok();

    // ─────────────────────────────────────────────────────────────────────────────
    // 3. 启动 Gateway 服务
    // ─────────────────────────────────────────────────────────────────────────────
    //
    // run() 函数是整个应用的入口，它会:
    //   - 连接 Postgres 数据库（用于存储 API Key、用户余额、调用日志等）
    //   - 连接 Redis（用于缓存、限流、会话状态等）
    //   - 从数据库加载模型路由表（哪些模型走哪个 Provider）
    //   - 检查各 AI Provider 的连通性（OpenAI、Anthropic、Google 等）
    //   - 启动 Axum HTTP 服务器监听指定端口
    //   - 打印启动摘要（模型数量、Provider 状态等）
    //   - 进入服务循环处理请求
    
    opt_router_gateway::run().await;
}
