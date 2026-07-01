import type { BlogCover } from './article-types'

const API_ROOT = 'https://api.unsplash.com'

interface UnsplashPhoto {
  id: string
  urls: { raw: string }
  links: { html: string; download_location: string }
  user: { name: string; links: { html: string } }
  alt_description: string | null
  description: string | null
}

interface UnsplashSearchResponse {
  results: UnsplashPhoto[]
}

export interface UnsplashSearchOptions {
  query: string
  orientation?: 'landscape' | 'portrait' | 'squarish'
  perPage?: number
  pick?: number
}

function requireAccessKey(): string {
  const key = process.env.UNSPLASH_ACCESS_KEY
  if (!key) {
    throw new Error('UNSPLASH_ACCESS_KEY is not set')
  }
  return key
}

export async function searchUnsplashCover(
  opts: UnsplashSearchOptions
): Promise<BlogCover | null> {
  const accessKey = requireAccessKey()
  const perPage = opts.perPage ?? 10
  const orientation = opts.orientation ?? 'landscape'

  const url = new URL(`${API_ROOT}/search/photos`)
  url.searchParams.set('query', opts.query)
  url.searchParams.set('per_page', String(perPage))
  url.searchParams.set('orientation', orientation)
  url.searchParams.set('content_filter', 'high')

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Client-ID ${accessKey}`,
      'Accept-Version': 'v1',
    },
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Unsplash search failed: ${res.status} — ${body.slice(0, 200)}`)
  }

  const data = (await res.json()) as UnsplashSearchResponse
  if (!data.results?.length) return null

  const idx = clamp(opts.pick ?? 0, 0, data.results.length - 1)
  const photo = data.results[idx]

  void triggerDownload(photo.links.download_location, accessKey)

  return {
    url: photo.urls.raw,
    photographer: photo.user.name,
    photographerUrl: photo.user.links.html,
    sourceUrl: photo.links.html,
    alt: photo.alt_description || photo.description || undefined,
  }
}

async function triggerDownload(downloadLocation: string, accessKey: string) {
  await fetch(downloadLocation, {
    headers: { Authorization: `Client-ID ${accessKey}` },
  })
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

export function pickIndexFromSeed(seed: string, mod: number): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h) % mod
}
