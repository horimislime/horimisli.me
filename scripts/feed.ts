import { parseISO } from 'date-fns';
import fs from 'fs';
import path from 'path';
import rss from 'rss';

import { findEntryById, listEntries } from '../src/entities/Entry';

async function generateFeed(filename: string, tags: string[] = []) {
  const feed = new rss({
    title: process.env.NEXT_PUBLIC_SITE_NAME,
    site_url: `https://${process.env.NEXT_PUBLIC_SITE_DOMAIN}`,
    feed_url: `https://${process.env.NEXT_PUBLIC_SITE_DOMAIN}/${filename}`,
  });

  const allEntries = await listEntries(10);
  const entries =
    tags.length === 0
      ? allEntries
      : allEntries.filter((entry) =>
          entry.categories.some((tag) => tags.includes(tag)),
        );
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
    path.join(process.cwd(), `public/${filename}`),
    feed.xml({ indent: true }),
  );
}

(async () => {
  await generateFeed('feed.xml');
  await generateFeed('feed-internal.xml', ['share']);
})();
