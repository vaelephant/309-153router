/**
 * 资讯 CLI 生成脚本用的选题配置（运行时方向）
 * 品牌 SEO / Agent 站点摘要请编辑 settings/brand.yaml
 */

export const BRAND = {
  name: 'OptRouter',
  productLine: '统一 AI 模型 API 网关',
  audience: '开发者 / AI 应用团队 / 技术负责人',
  positioning:
    'OpenAI 兼容的统一 API，多模型智能路由、Fallback、用量与成本分析，帮助团队降低 LLM 接入与运维成本。',
} as const

export const BRAND_KEYWORDS: string[] = [
  'LLM API 网关',
  'OpenAI 兼容 API',
  '多模型路由',
  'AI 成本优化',
  '模型 Fallback',
  'DeepSeek',
  'Claude API',
  'GPT API',
  'OpenRouter',
  'API 聚合',
  'token 计费',
  'enterprise AI infrastructure',
]

export const FALLBACK_TOPICS: {
  topic: string
  category: 'guide' | 'deep-dive' | 'compare' | 'routing' | 'product'
}[] = [
  { topic: '如何用统一 API 接入多个 LLM 供应商', category: 'guide' },
  { topic: '多模型路由中的 Fallback 策略设计', category: 'routing' },
  { topic: 'OpenAI vs Anthropic vs DeepSeek：企业选型对比', category: 'compare' },
  { topic: 'AI 网关中的 Token 用量与成本监控实践', category: 'deep-dive' },
  { topic: '从直连 OpenAI 迁移到 API 网关的 7 个步骤', category: 'guide' },
  { topic: '2026 年主流 LLM API 定价与路由优化思路', category: 'compare' },
  { topic: '智能路由如何根据延迟与成本选择模型', category: 'routing' },
  { topic: 'OptRouter 式网关在企业 AI 架构中的位置', category: 'product' },
]
