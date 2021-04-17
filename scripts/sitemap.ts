import fs from 'fs';
import path from 'path';

import { listEntries } from '../src/entities/Entry';

(async () => {
  const now = new Date().toISOString();
  const entries = await listEntries();
  const items = [
    {
      url: `https://${process.env.NEXT_PUBLIC_SITE_DOMAIN}/`,
      lastUpdated: now,
    },
    {
      url: `https://${process.env.NEXT_PUBLIC_SITE_DOMAIN}/entry/`,
      lastUpdated: now,
    },
    ...entries
      .filter((e) => e.type === 'normal')
      .map((e) => ({
        url: `https://${process.env.NEXT_PUBLIC_SITE_DOMAIN}/entry/${e.id}/`,
        lastUpdated: e.date,
      })),
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${items
    .map(
      (i) => `
  <url>
    <loc>${i.url}</loc>
    <lastmod>${i.lastUpdated}</lastmod>
  </url>`,
    )
    .join('')}
</urlset>`;

  fs.writeFileSync(path.join(process.cwd(), 'public/sitemap.xml'), sitemap);
})();
