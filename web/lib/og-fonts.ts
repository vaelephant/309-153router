const fontCache = new Map<string, ArrayBuffer>()

/** 为 next/og ImageResponse 加载 Google Font（支持中文）。 */
export async function loadGoogleFont(
  family: string,
  weight: number
): Promise<ArrayBuffer> {
  const key = `${family}:${weight}`
  const cached = fontCache.get(key)
  if (cached) return cached

  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&display=swap`
  const css = await (await fetch(cssUrl, { cache: 'force-cache' })).text()
  const match = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)
  if (!match?.[1]) {
    throw new Error(`Failed to load font ${family} ${weight}`)
  }
  const response = await fetch(match[1], { cache: 'force-cache' })
  if (!response.ok) {
    throw new Error(`Failed to fetch font file ${family} ${weight}`)
  }
  const data = await response.arrayBuffer()
  fontCache.set(key, data)
  return data
}
