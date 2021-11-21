import { parse, parseISO } from 'date-fns';
import { convertToTimeZone } from 'date-fns-timezone';
import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';
import remark from 'remark';
import html from 'remark-html';
import prism from 'remark-prism';

const postsDirectory = path.join(process.cwd(), 'posts');

type PostId = {
  params: { id: string };
};

export type EntryType = 'normal' | 'hatena' | 'qiita';

export class Entry {
  id: string;
  title: string;
  categories: string[];
  date: string;
  image?: string;
  published: boolean;
  content?: string;
  type: EntryType;
  externalURL?: string;
}

export function getAllEntryIds(): PostId[] {
  return getAllEntryPaths()
    .filter((p) => p.includes('/blog/'))
    .map((entryPath) => {
      return {
        params: {
          id: path.basename(entryPath).replace(/\.md$/, ''),
        },
      };
    });
}

const getAllEntryPaths = (directory = postsDirectory): string[] => {
  const fileNames = fs
    .readdirSync(directory)
    .filter((name) => !name.startsWith('.'));

  let paths: string[] = [];
  for (const fileName of fileNames) {
    const fullPath = path.join(directory, fileName);
    const stat = fs.lstatSync(fullPath);
    if (stat.isDirectory()) {
      const nestedPaths = getAllEntryPaths(fullPath);
      paths = paths.concat(nestedPaths);
      continue;
    }
    paths.push(fullPath);
  }
  return paths;
};

export async function listEntries(limit = undefined): Promise<Entry[]> {
  const entries = await Promise.all(getAllEntryPaths().map((p) => load(p)));
  return entries
    .filter((e) => process.env.INCLUDE_DRAFT === '1' || e.published)
    .sort((a, b) => {
      if (a.date < b.date) {
        return 1;
      } else {
        return -1;
      }
    })
    .slice(0, limit);
}

export async function findEntryById(
  id: string,
  includeBody = false,
): Promise<Entry> {
  const entryPath = getAllEntryPaths().filter(
    (postPath) => path.basename(postPath) === `${id}.md`,
  )[0];
  return load(entryPath, includeBody);
}

const checkEntryType = (matter: matter.GrayMatterFile<string>): EntryType => {
  if (matter.data['EditURL']?.includes('https://blog.hatena.ne.jp')) {
    return 'hatena';
  } else if (matter.data['URL']?.includes('https://qiita.com')) {
    return 'qiita';
  } else {
    return 'normal';
  }
};

const load = async (fullPath: string, includeBody = false): Promise<Entry> => {
  let fileContents: string;
  if (path.extname(fullPath) === '') {
    fileContents = fs.readFileSync(
      path.join(postsDirectory, `${fullPath}.md`),
      'utf8',
    );
  } else {
    fileContents = fs.readFileSync(fullPath, 'utf8');
  }

  const id = path.basename(fullPath, '.md');
  const matterResult = matter(fileContents);

  let content = '';
  if (includeBody) {
    const result = await remark()
      .use(html)
      .use(prism)
      .process(matterResult.content);
    content = result.toString();
  }

  const dateString = matterResult.data['date'] || matterResult.data['Date'];

  const normalizeDate = (data: string | Date) => {
    if (typeof data === 'object') {
      return data;
    }

    if (!data.includes('+')) {
      const format = data.includes(' ') ? 'yyyy-MM-dd HH:mm' : 'yyyy-MM-dd';
      return parse(data, format, new Date());
    }
    const token = data.split(' ');
    const normalized = `${token[0]}T${token[1]}${token[2]}`;
    const parsed = parseISO(normalized);
    return parsed;
  };

  const normalizedDate = normalizeDate(dateString);
  const date = convertToTimeZone(normalizedDate, { timeZone: 'Asia/Tokyo' });

  return {
    id: id,
    title: matterResult.data['title'] || matterResult.data['Title'],
    categories: matterResult.data['category'] ?? [],
    date: date.toISOString(),
    image: matterResult.data['image'] ?? '',
    content: content,
    published: matterResult.data['published'] ?? true,
    type: checkEntryType(matterResult),
    externalURL: matterResult.data['URL'] ?? '',
  };
};
