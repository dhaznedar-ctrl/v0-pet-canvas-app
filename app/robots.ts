import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/orders/', '/track/'],
    },
    sitemap: 'https://create.petcanvas.art/sitemap.xml',
  }
}
