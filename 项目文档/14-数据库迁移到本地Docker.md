# 数据库迁移到本地 Docker（PostgreSQL）

本文档说明如何将 153router 项目的数据库从远程 PostgreSQL 迁移到本机 Docker 中的 PostgreSQL 17。

---

## 一、前置条件

- 已安装 **Docker**（`docker --version` 可运行）
- 已安装 **psql**（可选；未安装时可用 Docker 临时执行，见下文）
- 知晓**源库**连接信息：主机、端口、用户、数据库名、密码

### 若无 psql：用 Homebrew 安装

```bash
brew install libpq
echo 'export PATH="/opt/homebrew/opt/libpq/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

或临时用 Docker 执行 psql（见下文「验证」小节）。

---

## 二、迁移步骤

### 1. 启动本地 PostgreSQL 17 容器

在项目根目录执行：

```bash
docker run -d \
  --name 153router-pg \
  -e POSTGRES_USER=txys \
  -e POSTGRES_PASSWORD=txys2023 \
  -e POSTGRES_DB=153router \
  -p 5432:5432 \
  --restart unless-stopped \
  postgres:17
```

确认容器在运行：

```bash
docker ps | grep 153router-pg
```

### 2. 从源库导出数据

将下面命令中的 `源主机`、`源端口`、`源用户`、`源数据库` 替换为实际值（如原远程库：`113.250.13.252`、`54321`、`txys`、`153router`）。执行时会提示输入源库密码。

```bash
cd /Users/yan/code/309-153router

pg_dump -h <源主机> -p <源端口> -U <源用户> -d <源数据库> \
  --no-owner --no-acl \
  -f backup_$(date +%Y%m%d).sql
```

示例（源库为 113.250.13.252:54321）：

```bash
pg_dump -h 113.250.13.252 -p 54321 -U txys -d 153router \
  --no-owner --no-acl \
  -f backup_$(date +%Y%m%d).sql
```

导出成功后，当前目录下会生成 `backup_YYYYMMDD.sql`。

### 3. 导入到本地 Docker 数据库

`backup_YYYYMMDD.sql` 请换成实际生成的文件名（或 `ls backup_*.sql` 查看）。

```bash
psql -h 127.0.0.1 -p 5432 -U txys -d 153router -f backup_YYYYMMDD.sql
```

密码为启动容器时设置的 `POSTGRES_PASSWORD`（如 `txys2023`）。

### 4. 修改项目配置指向本地库

**web/.env**

将 `DATABASE_URL` 改为本地：

```env
DATABASE_URL="postgresql://txys:txys2023@127.0.0.1:5432/153router?schema=public"
```

**gateway/.env**

修改数据库相关变量为本地：

```env
DATABASE_URL=postgres://txys:txys2023@127.0.0.1:5432/153router
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=txys
DB_NAME=153router
```

如有 `DB_POOL_SIZE`、`DB_MAX_OVERFLOW` 等可保持不变。

### 5. 验证迁移

- **查版本与表数量**（任选其一）：

  本机有 psql 时：

  ```bash
  psql -h 127.0.0.1 -p 5432 -U txys -d 153router -c "SELECT version();"
  psql -h 127.0.0.1 -p 5432 -U txys -d 153router -c "\dt"
  ```

  无 psql 时用 Docker：

  ```bash
  docker run --rm postgres:17 psql -h host.docker.internal -p 5432 -U txys -d 153router -c "SELECT version();"
  ```

  （macOS/Windows 可用 `host.docker.internal`；Linux 需用宿主机 IP 或 `--network host`。）

- **Prisma 迁移状态**（在 web 目录）：

  ```bash
  cd web && npx prisma migrate status
  ```

  若显示已应用的迁移与当前 schema 一致即可。

- 启动 **web** 与 **gateway** 服务，做一次登录/接口调用，确认读写正常。

---

## 三、常用 Docker 命令

| 说明           | 命令 |
|----------------|------|
| 查看容器状态   | `docker ps -a \| grep 153router-pg` |
| 查看日志       | `docker logs 153router-pg` |
| 停止容器       | `docker stop 153router-pg` |
| 启动已有容器   | `docker start 153router-pg` |
| 删除容器       | `docker stop 153router-pg && docker rm 153router-pg` |

数据在容器内，未挂载卷；**删除容器会丢失本地库数据**。若需持久化，可改用挂载卷或 docker-compose（见下文可选步骤）。

---

## 四、可选：使用 docker-compose 与数据卷

若希望数据持久化、重启不丢，可在项目根目录新增 `docker-compose.yml`：

```yaml
services:
  postgres:
    image: postgres:17
    container_name: 153router-pg
    environment:
      POSTGRES_USER: txys
      POSTGRES_PASSWORD: txys2023
      POSTGRES_DB: 153router
    ports:
      - "5432:5432"
    volumes:
      - pgdata_153router:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  pgdata_153router:
```

首次使用前若已有同名容器，需先停止并删除：`docker stop 153router-pg && docker rm 153router-pg`。然后执行：

```bash
docker compose up -d postgres
```

迁移步骤中「导出」「导入」与「修改 .env」不变，仅保证导入目标是本机 5432 的该 compose 中的 Postgres 即可。

---

## 五、版本说明

- 源库为 **PostgreSQL 15.x** 时，迁移到 **PostgreSQL 17** 兼容；`pg_dump` 导出的 SQL 可直接用 `psql` 导入到 17。
- 若希望与源库大版本一致，可将上述 `postgres:17` 改为 `postgres:15`，步骤相同。

---

*文档版本：2026-03，基于实际迁移整理。*
