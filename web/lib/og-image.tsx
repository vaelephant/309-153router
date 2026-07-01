import { ImageResponse } from 'next/og'

import { loadGoogleFont } from '@/lib/og-fonts'
import { ogCopy, OG_IMAGE_SIZE } from '@/lib/seo'

export { OG_IMAGE_SIZE }

const BRAND_PRIMARY = '#6366f1'
const BRAND_ACCENT = '#818cf8'

type OgImageOptions = {
  title: string
  description: string
  kicker?: string
  tagline?: string
  features?: readonly string[]
  descriptionFontSize?: number
}

export async function createOgImage({
  title,
  description,
  kicker = 'OptRouter',
  tagline = ogCopy.tagline,
  features = ogCopy.features,
  descriptionFontSize = 26,
}: OgImageOptions) {
  const [fontRegular, fontBold] = await Promise.all([
    loadGoogleFont('Noto Sans SC', 400),
    loadGoogleFont('Noto Sans SC', 700),
  ])

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 45%, #0f3460 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -120,
            right: -80,
            width: 520,
            height: 520,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${BRAND_PRIMARY}55 0%, transparent 68%)`,
          }}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            position: 'relative',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: BRAND_PRIMARY,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 28,
              fontWeight: 700,
              fontFamily: 'Noto Sans SC',
            }}
          >
            O
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: '#f8fafc',
                fontFamily: 'Noto Sans SC',
              }}
            >
              {kicker}
            </span>
            <span
              style={{
                fontSize: 18,
                color: BRAND_ACCENT,
                fontFamily: 'Noto Sans SC',
              }}
            >
              {tagline}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'relative' }}>
          <div
            style={{
              fontSize: 52,
              fontWeight: 700,
              color: '#f8fafc',
              lineHeight: 1.25,
              fontFamily: 'Noto Sans SC',
              maxWidth: 900,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: descriptionFontSize,
              color: '#cbd5e1',
              lineHeight: 1.5,
              fontFamily: 'Noto Sans SC',
              maxWidth: 880,
            }}
          >
            {description}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            position: 'relative',
          }}
        >
          {features.slice(0, 4).map((feature) => (
            <div
              key={feature}
              style={{
                padding: '8px 16px',
                borderRadius: 999,
                background: 'rgba(99, 102, 241, 0.25)',
                border: '1px solid rgba(129, 140, 248, 0.4)',
                color: '#e2e8f0',
                fontSize: 18,
                fontFamily: 'Noto Sans SC',
              }}
            >
              {feature}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...OG_IMAGE_SIZE,
      fonts: [
        { name: 'Noto Sans SC', data: fontRegular, weight: 400, style: 'normal' },
        { name: 'Noto Sans SC', data: fontBold, weight: 700, style: 'normal' },
      ],
    }
  )
}
