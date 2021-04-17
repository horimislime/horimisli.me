import { parseISO } from 'date-fns';
import fs from 'fs';
import path from 'path';
import rss from 'rss';

import { findEntryById, listEntries } from '../src/entities/Entry';

(async () => {
  const feed = new rss({
    title: process.env.NEXT_PUBLIC_SITE_NAME,
    site_url: `https://${process.env.NEXT_PUBLIC_SITE_DOMAIN}`,
    feed_url: `https://${process.env.NEXT_PUBLIC_SITE_DOMAIN}/feed.xml`,
  });

  const entries = await listEntries(10);
  const entriesWithBody = await Promise.all(
    entries.map((e) => findEntryById(e.id, true)),
  );
  entriesWithBody.forEach((entry) => {
    feed.item({
      title: entry.title,
      url: `https://${process.env.NEXT_PUBLIC_SITE_DOMAIN}/entry/${entry.id}/`,
      date: parseISO(entry.date),
      description: entry.content,
      author: process.env.NEXT_PUBLIC_SITE_AUTHOR,
    });
  });

  fs.writeFileSync(
    path.join(process.cwd(), 'public/feed.xml'),
    feed.xml({ indent: true }),
  );
})();
