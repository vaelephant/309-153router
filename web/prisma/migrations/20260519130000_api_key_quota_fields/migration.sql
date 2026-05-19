-- D2/W4: API Key 月度配额与模型白名单
ALTER TABLE "api_keys" ADD COLUMN IF NOT EXISTS "monthly_request_quota" INTEGER;
ALTER TABLE "api_keys" ADD COLUMN IF NOT EXISTS "allowed_models" TEXT[] NOT NULL DEFAULT '{}';
