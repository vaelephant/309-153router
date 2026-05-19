-- 创建超级管理员账号
-- 登录手机号: 13800138000  密码: admin
-- 执行: psql $DATABASE_URL -f web/prisma/scripts/seed_superadmin.sql
-- 或: 在 psql / 任意 SQL 客户端中执行本文件

-- 启用 pgcrypto（用于 bcrypt 密码）
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 存在则更新密码与角色，不存在则插入
INSERT INTO users (id, phone, password, role, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '13800138000',
  crypt('admin', gen_salt('bf', 10)),
  'superadmin',
  now(),
  now()
)
ON CONFLICT (phone) DO UPDATE SET
  password = crypt('admin', gen_salt('bf', 10)),
  role = 'superadmin',
  updated_at = now();
