import 'server-only'

import fs from 'node:fs'
import path from 'node:path'

import { parse } from 'yaml'

export type BrandEdition = {
  name: string
  config: string
  audience: string
  priceRangeCny: string
}

export type BrandSiteLink = {
  path: string
  title: string
  description: string
}

export type BrandConfig = {
  brand: {
    name: string
    shortName: string
    ogTagline: string
    twitter: string
    themeColor: string
  }
  productCore: {
    positioning: string
    pillars: string
    capabilities: string[]
  }
  seo: {
    descriptionSuffix: string
    keywords: string[]
  }
  og: {
    shortDescriptionFontSize: number
    blog: { title: string; description: string }
    register: { title: string; description: string }
    invite: { title: string; description: string }
  }
  jsonLd: {
    offerDescription: string
  }
  agents: {
    purpose: string
    oneLiner: string
    targetAudience: string
    contactAction: string
    license: string
    editions: BrandEdition[]
    siteLinks: BrandSiteLink[]
  }
}

let cached: BrandConfig | null = null

/** 读取 settings/brand.yaml（进程内缓存，改 YAML 后需重启 dev）。 */
export function loadBrandConfig(): BrandConfig {
  if (cached) return cached
  const file = path.join(process.cwd(), 'settings/brand.yaml')
  cached = parse(fs.readFileSync(file, 'utf8')) as BrandConfig
  return cached
}
