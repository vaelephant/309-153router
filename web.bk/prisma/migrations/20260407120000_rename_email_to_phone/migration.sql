-- 登录标识由邮箱改为手机号：列重命名（原 email 列内若为邮箱字符串，需自行数据迁移或清空后重建）
ALTER TABLE "users" RENAME COLUMN "email" TO "phone";

ALTER TABLE "user_login_logs" RENAME COLUMN "email" TO "phone";
DROP INDEX IF EXISTS "idx_user_login_logs_email";
CREATE INDEX "idx_user_login_logs_phone" ON "user_login_logs" ("phone");

ALTER TABLE "user_behavior_logs" RENAME COLUMN "email" TO "phone";
DROP INDEX IF EXISTS "idx_user_behavior_logs_email";
CREATE INDEX "idx_user_behavior_logs_phone" ON "user_behavior_logs" ("phone");
