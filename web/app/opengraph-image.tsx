import { createOgImage, OG_IMAGE_SIZE } from '@/lib/og-image'
import { ogCopy, siteSeo } from '@/lib/seo'

export const alt = siteSeo.title
export const size = OG_IMAGE_SIZE
export const contentType = 'image/png'

export default async function OpenGraphImage() {
  const { title, description, descriptionFontSize } = ogCopy.home
  return createOgImage({
    title,
    description,
    descriptionFontSize,
    kicker: siteSeo.name,
  })
}
