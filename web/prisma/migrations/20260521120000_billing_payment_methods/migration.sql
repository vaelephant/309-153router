-- Billing P1: 支付方式 + Webhook 幂等

CREATE TABLE IF NOT EXISTS "payment_methods" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "pay_provider" VARCHAR(20) NOT NULL DEFAULT 'STRIPE',
    "gateway_pm_id" VARCHAR(64) NOT NULL,
    "gateway_customer_id" VARCHAR(64),
    "brand" VARCHAR(32),
    "last4" VARCHAR(4),
    "exp_month" INTEGER,
    "exp_year" INTEGER,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "payment_methods_user_gateway_pm_key"
    ON "payment_methods"("user_id", "gateway_pm_id");

CREATE INDEX IF NOT EXISTS "idx_payment_methods_user_id"
    ON "payment_methods"("user_id");

ALTER TABLE "payment_methods"
    ADD CONSTRAINT "payment_methods_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "billing_webhook_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_id" VARCHAR(128) NOT NULL,
    "event_type" VARCHAR(64) NOT NULL,
    "processed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "billing_webhook_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "billing_webhook_events_event_id_key"
    ON "billing_webhook_events"("event_id");
