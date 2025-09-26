/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://silentscribe.dev',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: ['/api/*', '/admin/*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
    ],
    additionalSitemaps: [
      'https://silentscribe.dev/sitemap.xml',
    ],
  },
  transform: async (config, path) => {
    // Custom priority for different page types
    const priorities = {
      '/': 1.0,
      '/beta': 0.9,
      '/privacy': 0.5,
      '/terms': 0.5,
    }

    return {
      loc: path,
      changefreq: path === '/' ? 'weekly' : 'monthly',
      priority: priorities[path] || 0.7,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    }
  },
}
