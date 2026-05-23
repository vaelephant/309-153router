import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 避免 monorepo 根目录其它 lockfile 被误判为 workspace root（Next 16 + Turbopack）
  turbopack: {
    root: __dirname,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // 访问统计写入 web/data/pageViews.json，勿让 dev 文件监听触发整页热重载（dev --webpack）
  // Next 16 webpack 校验要求 ignored 仅为非空 glob 字符串（不可合并默认 RegExp）
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/.next/**',
          '**/data/**',
        ],
      }
    }
    return config
  },
}

export default nextConfig
