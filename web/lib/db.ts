import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
  // eslint-disable-next-line no-var
  var pgPool: Pool | undefined
}

let prismaSingleton: PrismaClient | undefined

function getPgPool(): Pool {
  if (global.pgPool) {
    return global.pgPool
  }

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  global.pgPool = new Pool({
    connectionString: databaseUrl,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000,
    ssl:
      /(^|[?&])sslmode=require(&|$)/i.test(databaseUrl) ||
      /(^|[?&])ssl=true(&|$)/i.test(databaseUrl) ||
      process.env.PGSSLMODE === 'require' ||
      process.env.DATABASE_SSL === '1'
        ? { rejectUnauthorized: false }
        : undefined,
  })

  return global.pgPool
}

function createPrismaClient(): PrismaClient {
  const pool = getPgPool()
  const adapter = new PrismaPg(pool)
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

/** 首次访问 DB 时才连接，避免 next build 收集页面数据阶段因无 DATABASE_URL 失败 */
function getPrismaClient(): PrismaClient {
  if (process.env.NODE_ENV !== 'production' && global.prisma) {
    return global.prisma
  }
  if (prismaSingleton) {
    return prismaSingleton
  }

  const client = createPrismaClient()
  prismaSingleton = client
  if (process.env.NODE_ENV !== 'production') {
    global.prisma = client
  }
  return client
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrismaClient()
    const value = Reflect.get(client, prop, receiver)
    return typeof value === 'function' ? value.bind(client) : value
  },
})

export { prisma as default }
