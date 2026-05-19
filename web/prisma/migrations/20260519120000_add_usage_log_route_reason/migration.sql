-- G4/D1: 智能路由原因摘要（网关 bill_in_tx / insert_failure_log 写入）
ALTER TABLE "usage_logs" ADD COLUMN IF NOT EXISTS "route_reason" VARCHAR(512);
