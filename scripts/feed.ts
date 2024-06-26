import { parseISO } from 'date-fns';
import fs from 'fs';
import path from 'path';
import rss from 'rss';

import { findEntryById, listEntries } from '../src/entities/Entry.js';

async function generateFeed(
  filename: string,
  tags: string[] = [],
  includeTags: boolean = false,
) {
  const feed = new rss({
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    title: process.env.NEXT_PUBLIC_SITE_NAME!,
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
  for (const entry of entriesWithBody) {
    const tagsString = entry.categories
      .filter((tag) => tag != 'share')
      .map((tag) => `#${tag}`)
      .join(' ');
    feed.item({
      title: includeTags ? `${entry.title} ${tagsString}` : entry.title,
      url: `https://${process.env.NEXT_PUBLIC_SITE_DOMAIN}/entry/${entry.id}/`,
      date: parseISO(entry.date),
      description: '',
      author: process.env.NEXT_PUBLIC_SITE_AUTHOR,
    });
  }

  fs.writeFileSync(
    path.join(process.cwd(), `public/${filename}`),
    feed.xml({ indent: true }),
  );
}

(async () => {
  await generateFeed('feed.xml');
  await generateFeed('feed-internal.xml', ['share'], true);
})();
