#!/usr/bin/env bash
#
# 每日新闻资讯自动生成（Linux cron / systemd 调用）
#
# ── 1. 赋予执行权限 ──
#   chmod +x /path/to/web/scripts/daily-news-cron.sh
#
# ── 2. 配置 web/.env ──
#   OPENAI_API_KEY=sk-...
#   UNSPLASH_ACCESS_KEY=...          (可选)
#   HTTP_PROXY=...                   (仅本机需代理时；Linux 服务器通常直连，可不配)
#   NEXT_REBUILD_HOOK_URL=...        (可选，生成后触发 Vercel/CI 重新部署)
#   NEWS_CRON_GIT_PUSH=1             (可选，生成后 git add/commit/push content/news)
#   DINGTALK_NEWS_WEBHOOK_URL        (可选，生成成功后钉钉播报，需配合 DINGTALK_NEWS_SECRET)
#   DINGTALK_NEWS_SECRET=
#   DINGTALK_NEWS_ENABLED=true       (可选，显式开启；不配则 webhook+secret 都有时自动启用)
#
# ── 3. 注册 crontab (crontab -e) ──
#   每天早上 7:00 执行：
#   0 7 * * * /path/to/web/scripts/daily-news-cron.sh
#
#   脚本会自行追加日志到 web/logs/news-cron.log
#
# ── 4. 手动测试 ──
#   cd /path/to/web && ./scripts/daily-news-cron.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_FILE="${NEWS_CRON_LOG:-$PROJECT_ROOT/logs/news-cron.log}"

mkdir -p "$(dirname "$LOG_FILE")"

log() {
  local msg="[$(date '+%Y-%m-%d %H:%M:%S')] $*"
  echo "$msg" | tee -a "$LOG_FILE"
}

# cron 环境 PATH 很窄，补常见 Node 安装路径
export PATH="/usr/local/bin:/usr/bin:/bin:$HOME/.nvm/versions/node/current/bin:$HOME/.local/share/fnm/current/bin:$PATH"

cd "$PROJECT_ROOT"

log "=== daily news generation start ==="
log "project root: $PROJECT_ROOT"

if ! command -v node >/dev/null 2>&1; then
  log "✗ node not found on PATH"
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  log "✗ npm not found on PATH"
  exit 1
fi

log "node: $(node --version)"
log "npm:  $(npm --version)"

if npm run news:generate:daily >>"$LOG_FILE" 2>&1; then
  log "✓ generation succeeded"
else
  log "✗ generation failed (see log above)"
  exit 1
fi

# 可选：提交到 Git（适合「部署拉仓库」的工作流）
if [ "${NEWS_CRON_GIT_PUSH:-}" = "1" ]; then
  if command -v git >/dev/null 2>&1 && git -C "$PROJECT_ROOT" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    log "→ git commit & push content/news"
    git -C "$PROJECT_ROOT" add content/news/
    if git -C "$PROJECT_ROOT" diff --cached --quiet; then
      log "  (no new files to commit)"
    else
      git -C "$PROJECT_ROOT" commit -m "chore(news): daily auto-generated article $(date '+%F')"
      git -C "$PROJECT_ROOT" push
      log "✓ git push done"
    fi
  else
    log "⚠ NEWS_CRON_GIT_PUSH=1 but git repo not found"
  fi
fi

# 可选：触发远程重新部署
if [ -n "${NEXT_REBUILD_HOOK_URL:-}" ]; then
  log "→ triggering rebuild hook"
  if curl -fsSL -X POST "$NEXT_REBUILD_HOOK_URL" >>"$LOG_FILE" 2>&1; then
    log "✓ rebuild triggered"
  else
    log "⚠ rebuild hook returned non-zero"
  fi
fi

log "=== done ==="
