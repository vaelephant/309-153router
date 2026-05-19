//! 指标与计量模块
//!
//! - [`token_counter`]：Token 计数与费用计算

pub mod prometheus;
pub mod token_counter;

pub use prometheus::{inc_chat_request, inc_http_request, inc_stream_billing_estimated, record_chat_outcome};
pub use token_counter::compute_cost;
