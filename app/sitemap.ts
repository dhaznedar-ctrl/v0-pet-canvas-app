import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://create.petcanvas.art'

  return [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/create`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/pets`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/family`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/kids`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/our-story`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/support`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/policies/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/policies/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/policies/refund`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/policies/license`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]
}
