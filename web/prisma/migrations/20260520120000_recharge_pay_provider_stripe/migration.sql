-- 充值订单允许 Stripe 渠道（若存在旧 CHECK 约束则扩展）
ALTER TABLE "recharge_orders" DROP CONSTRAINT IF EXISTS "chk_pay_provider";
ALTER TABLE "recharge_orders" ADD CONSTRAINT "chk_pay_provider"
  CHECK ("pay_provider" IN ('WECHAT', 'ALIPAY', 'STRIPE'));
