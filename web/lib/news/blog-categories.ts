import type { BlogCategory } from './article-types'

export const BLOG_CATEGORIES: BlogCategory[] = [
  'guide',
  'deep-dive',
  'compare',
  'routing',
  'product',
]

export const BLOG_CATEGORY_LABELS: Record<BlogCategory, string> = {
  guide: '实践指南',
  'deep-dive': '技术深读',
  compare: '选型对比',
  routing: '智能路由',
  product: '产品动态',
}

export const BLOG_CATEGORY_DESCRIPTIONS: Record<BlogCategory, string> = {
  guide: 'API 接入、SDK 集成与开发者最佳实践。',
  'deep-dive': '模型路由、成本优化与网关架构的技术细节。',
  compare: '多模型、多供应商方案的成本与能力对比。',
  routing: 'Fallback、负载均衡与智能路由策略。',
  product: 'OptRouter 产品更新与功能发布。',
}

export const BLOG_CATEGORY_UNSPLASH_QUERIES: Record<BlogCategory, string> = {
  guide: 'developer code abstract',
  'deep-dive': 'server network abstract technology',
  compare: 'data analytics dashboard',
  routing: 'circuit technology blue abstract',
  product: 'cloud software minimal',
}

export function getBlogCategoryLabel(category: BlogCategory) {
  return BLOG_CATEGORY_LABELS[category]
}
