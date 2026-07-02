import type { MetadataRoute } from 'next'

import { getSiteUrl } from '@/lib/site-url'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl()
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/agents',
          '/agents.json',
          '/llms.txt',
          '/zh/blog',
          '/en/blog',
          '/ja/blog',
          '/zh/promo',
          '/zh/login',
          '/zh/register',
        ],
        disallow: [
          '/dashboard',
          '/admin',
          '/superadmin',
          '/api/',
          '/recharge',
          '/billing',
          '/keys',
          '/analytics',
          '/settings',
          '/invite',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
