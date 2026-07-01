import type { MetadataRoute } from 'next'

import { loadBrandConfig } from '@/lib/load-brand'
import { getSiteUrl } from '@/lib/site-url'

export default function manifest(): MetadataRoute.Manifest {
  const brand = loadBrandConfig()
  return {
    name: brand.brand.name,
    short_name: brand.brand.shortName,
    description: brand.productCore.positioning,
    start_url: '/zh',
    display: 'standalone',
    background_color: brand.brand.themeColor,
    theme_color: brand.brand.themeColor,
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
  }
}
