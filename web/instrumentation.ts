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

      // 简单测活：resolve 一下 hostname（本地 127.0.0.1 直接 pass）
      const { isIP } = await import('net')
      const isLocal = isIP(u.hostname) > 0 || u.hostname === 'localhost'
      if (isLocal) {
        console.log(`  ${ok('数据库地址为本地，跳过 DNS 探测')}`)
      } else {
        const dns = await import('dns/promises')
        await dns.lookup(u.hostname)
        console.log(`  ${ok(`DNS 解析成功: ${u.hostname}`)}`)
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

  // ── Redis ────────────────────────────────────────────────
  console.log(`\n${c.bold}[6] Redis${c.reset}`)
  const redisHost = process.env.REDIS_HOST || 'localhost'
  const redisPort = process.env.REDIS_PORT || '6379'
  console.log(kv('REDIS', `${redisHost}:${redisPort}`))

  console.log(`\n${c.bold}${c.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}\n`)
}
