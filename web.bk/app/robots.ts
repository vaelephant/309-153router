import type { MetadataRoute } from 'next'

const SITE_URL = 'https://optrouter.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/promo', '/login', '/register'],
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
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
