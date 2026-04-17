const fs   = require('fs');
const path = require('path');

const DOMAIN = 'https://blogy.in';

const data = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../src/data/startup-names.json'), 'utf8')
);

const staticRoutes = ['/', '/startup-names'];
const dynamicRoutes = data.categories.map(c => `/startup-names/${c.slug}`);
const allRoutes = [...staticRoutes, ...dynamicRoutes];

const today = new Date().toISOString().split('T')[0];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes.map(route => `  <url>
    <loc>${DOMAIN}${route}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route === '/' ? 'weekly' : 'monthly'}</changefreq>
    <priority>${route === '/' ? '1.0' : route === '/startup-names' ? '0.8' : '0.7'}</priority>
  </url>`).join('\n')}
</urlset>
`;

const outPath = path.resolve(__dirname, '../public/sitemap.xml');
fs.writeFileSync(outPath, xml);
console.log(`✅  Sitemap → ${outPath}  (${allRoutes.length} URLs)`);
