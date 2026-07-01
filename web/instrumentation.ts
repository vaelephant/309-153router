export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  const c = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m',
    blue: '\x1b[34m',
  }

  const ok = (s: string) => `${c.green}✓${c.reset} ${s}`
  const warn = (s: string) => `${c.yellow}⚠${c.reset} ${s}`
  const fail = (s: string) => `${c.red}✗${c.reset} ${s}`
  const kv = (k: string, v: string) => `  ${c.gray}${k.padEnd(28)}${c.reset}${c.cyan}${v}${c.reset}`

  console.log(`\n${c.bold}${c.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}`)
  console.log(`${c.bold}  OptRouter Web — 启动配置检查${c.reset}`)
  console.log(`${c.bold}${c.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}\n`)

  // ── 基础环境 ──────────────────────────────────────────────
  console.log(`${c.bold}[1] 基础环境${c.reset}`)
  console.log(kv('ENV', process.env.ENV || '(未设置，默认 production)'))
  console.log(kv('NODE_ENV', process.env.NODE_ENV || '(未设置)'))
  console.log(kv('DEBUG', process.env.DEBUG || 'false'))
  console.log(kv('NEXT_PUBLIC_BASE_URL', process.env.NEXT_PUBLIC_BASE_URL || '(未设置)'))

  // ── 数据库 ───────────────────────────────────────────────
  console.log(`\n${c.bold}[2] 数据库${c.reset}`)
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    console.log(`  ${fail('DATABASE_URL 未设置！数据库功能将无法使用')}`)
  } else {
    try {
      const u = new URL(dbUrl)
      const masked = `${u.protocol}//${u.username}:***@${u.hostname}:${u.port}${u.pathname}`
      console.log(kv('DATABASE_URL', masked))
      console.log(kv('DB Host', `${u.hostname}:${u.port}`))

      // 仅做本地/内网判断，不依赖 Node 内置 net/dns，避免 bundler 报 Module not found
      const isLocalHost = u.hostname === 'localhost' || u.hostname === '127.0.0.1'
      const isPrivateIP = /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/.test(u.hostname)
      const isLocal = isLocalHost || isPrivateIP
      if (isLocal) {
        console.log(`  ${ok('数据库地址为本地/内网')}`)
      } else {
        console.log(`  ${ok(`数据库主机: ${u.hostname}`)}`)
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      console.log(`  ${warn(`DATABASE_URL 解析/探测失败: ${msg}`)}`)
    }
  }

  // ── Gateway ──────────────────────────────────────────────
  console.log(`\n${c.bold}[3] AI Gateway${c.reset}`)
  const gatewayUrl = process.env.GATEWAY_URL || 'http://localhost:9115'
  const usingFallback = !process.env.GATEWAY_URL
  console.log(kv('GATEWAY_URL', gatewayUrl + (usingFallback ? `  ${c.yellow}(env 未设置，使用默认值)${c.reset}` : '')))

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 3000)
    const res = await fetch(`${gatewayUrl}/health`, { signal: controller.signal })
    clearTimeout(timer)
    if (res.ok) {
      console.log(`  ${ok(`Gateway 健康检查通过 (HTTP ${res.status})`)}`)
    } else {
      console.log(`  ${warn(`Gateway 返回 HTTP ${res.status}，请确认网关状态`)}`)
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.includes('abort') || msg.includes('timeout')) {
      console.log(`  ${fail(`Gateway 连接超时 (3s) → ${gatewayUrl}`)}`)
    } else {
      console.log(`  ${fail(`Gateway 无法连接 → ${gatewayUrl}`)}`)
      console.log(`  ${c.gray}  原因: ${msg}${c.reset}`)
    }
  }

  // ── 支付网关 ─────────────────────────────────────────────
  console.log(`\n${c.bold}[4] 支付网关${c.reset}`)
  const payUrl = process.env.PAYMENT_GATEWAY_BASE_URL
  const payKey = process.env.PAYMENT_GATEWAY_API_KEY
  if (!payUrl) {
    console.log(`  ${warn('PAYMENT_GATEWAY_BASE_URL 未设置，充值功能不可用')}`)
  } else {
    console.log(kv('PAYMENT_GATEWAY_BASE_URL', payUrl))
    console.log(kv('PAYMENT_GATEWAY_APP_ID', process.env.PAYMENT_GATEWAY_APP_ID || '(未设置)'))
    console.log(kv('API_KEY', payKey ? payKey.slice(0, 6) + '…' + payKey.slice(-4) : '(未设置)'))
  }

  // ── 通知 ─────────────────────────────────────────────────
  console.log(`\n${c.bold}[5] 通知${c.reset}`)
  const dtEnabled = process.env.DINGTALK_ENABLED === 'true'
  const dtWebhook = process.env.DINGTALK_WEBHOOK_URL
  if (dtEnabled && !dtWebhook) {
    console.log(`  ${warn('DINGTALK_ENABLED=true 但 DINGTALK_WEBHOOK_URL 未设置')}`)
  } else if (dtEnabled) {
    console.log(`  ${ok('钉钉通知已启用')}`)
    console.log(kv('DINGTALK_WEBHOOK_URL', dtWebhook!.slice(0, 50) + '…'))
  } else {
    console.log(`  ${c.gray}  钉钉通知已关闭${c.reset}`)
  }

  const rechargeWebhook = process.env.DINGTALK_RECHARGE_WEBHOOK_URL?.trim()
  const rechargeEnabled =
    process.env.DINGTALK_RECHARGE_ENABLED === 'true' ||
    process.env.DINGTALK_RECHARGE_ENABLED === '1'
  if (rechargeEnabled && rechargeWebhook) {
    console.log(`  ${ok('充值钉钉：专用机器人 (DINGTALK_RECHARGE_*)')}`)
    console.log(kv('DINGTALK_RECHARGE_WEBHOOK_URL', rechargeWebhook.slice(0, 50) + '…'))
  } else if (rechargeEnabled) {
    console.log(`  ${warn('充值钉钉已启用但未配置 DINGTALK_RECHARGE_WEBHOOK_URL')}`)
  } else {
    console.log(`  ${c.gray}  充值钉钉未启用（与注册/登录独立）${c.reset}`)
  }

  const contactWebhook = process.env.DINGTALK_CONTACT_WEBHOOK_URL?.trim()
  const leadConfigured = Boolean(
    process.env.LEAD_API_BASE_URL?.trim() &&
      process.env.LEAD_API_KEY?.trim() &&
      (process.env.LEAD_PROJECT_NAME?.trim() || process.env.LEAD_PROJECT_SLUG?.trim())
  )
  const contactUsesMain = !contactWebhook && dtEnabled && dtWebhook
  if (contactWebhook) {
    console.log(`  ${ok('留资钉钉：专用机器人 (DINGTALK_CONTACT_WEBHOOK_URL)')}`)
    console.log(kv('DINGTALK_CONTACT_WEBHOOK_URL', contactWebhook.slice(0, 50) + '…'))
  } else if (contactUsesMain) {
    console.log(`  ${ok('留资钉钉：复用主机器人 (DINGTALK_WEBHOOK_URL)')}`)
  } else if (!leadConfigured) {
    console.log(
      `  ${warn('留资不可用：请配置 DINGTALK_CONTACT_WEBHOOK_URL，或 DINGTALK_ENABLED + DINGTALK_WEBHOOK_URL')}`
    )
  } else {
    console.log(`  ${c.gray}  留资钉钉未配置（仅写入线索 API）${c.reset}`)
  }

  const newsWebhook = process.env.DINGTALK_NEWS_WEBHOOK_URL?.trim()
  const newsSecret = process.env.DINGTALK_NEWS_SECRET?.trim()
  const newsEnabled =
    process.env.DINGTALK_NEWS_ENABLED === 'true' ||
    process.env.DINGTALK_NEWS_ENABLED === '1' ||
    Boolean(newsWebhook && newsSecret)
  if (newsEnabled && newsWebhook && newsSecret) {
    console.log(`  ${ok('新闻钉钉：专用机器人 (DINGTALK_NEWS_*)')}`)
    console.log(kv('DINGTALK_NEWS_WEBHOOK_URL', newsWebhook.slice(0, 50) + '…'))
  } else if (newsEnabled) {
    console.log(
      `  ${warn('新闻钉钉：需同时配置 DINGTALK_NEWS_WEBHOOK_URL 与 DINGTALK_NEWS_SECRET')}`
    )
  } else {
    console.log(`  ${c.gray}  新闻钉钉未启用（AI 生成资讯播报）${c.reset}`)
  }

  // ── Redis ────────────────────────────────────────────────
  console.log(`\n${c.bold}[6] Redis${c.reset}`)
  const redisHost = process.env.REDIS_HOST || 'localhost'
  const redisPort = process.env.REDIS_PORT || '6379'
  console.log(kv('REDIS', `${redisHost}:${redisPort}`))

  console.log(`\n${c.bold}${c.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}\n`)
}
