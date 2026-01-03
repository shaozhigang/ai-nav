import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://toolso.ai'

  // Static routes with SEO priority for AI tools directory
  const staticRoutes = [
    { path: '', changeFreq: 'daily' as const, priority: 1.0 },
    { path: '/tools', changeFreq: 'daily' as const, priority: 0.95 },  // AI tools directory - high priority
    { path: '/blog', changeFreq: 'weekly' as const, priority: 0.8 },
    { path: '/contact', changeFreq: 'monthly' as const, priority: 0.5 },
    { path: '/privacy', changeFreq: 'monthly' as const, priority: 0.3 },
    { path: '/terms', changeFreq: 'monthly' as const, priority: 0.3 },
    { path: '/cookies', changeFreq: 'monthly' as const, priority: 0.3 },
  ]

  // Generate sitemap entries for both languages
  const locales = ['zh', 'en']
  const sitemapEntries: MetadataRoute.Sitemap = []

  locales.forEach((locale) => {
    staticRoutes.forEach((route) => {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${route.path}`,
        lastModified: new Date(),
        changeFrequency: route.changeFreq,
        priority: route.priority,
        alternates: {
          languages: {
            zh: `${baseUrl}/zh${route.path}`,
            en: `${baseUrl}/en${route.path}`,
          },
        },
      })
    })
  })

  return sitemapEntries
}
