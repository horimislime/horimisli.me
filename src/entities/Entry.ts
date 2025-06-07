import { parse, parseISO } from 'date-fns';
import { convertToTimeZone } from 'date-fns-timezone';
import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';
import rehypeRaw from 'rehype-raw';
import stringify from 'rehype-stringify';
import type { Parser } from 'unified';
import { unified } from 'unified';
import type { OrgNode } from 'uniorg';
import { extractKeywords } from 'uniorg-extract-keywords';
import { ParseOptions } from 'uniorg-parse/lib/parse-options';
import { parse as uparse } from 'uniorg-parse/lib/parser.js';
import uniorg2rehype from 'uniorg-rehype';

const options: ParseOptions = {
  todoKeywords: ['TODO', 'DONE'],
  useSubSuperscripts: '{}',
  // Interestingly enough, zero-width space (\u200b) is not considered
  // a space in unicode but is considered a space by Emacs. This is
  // why we have to add \u200b explicitly after \s in the
  // regex. Otherwise, the suggested use-case of adding ZWSP as a
  // markup border does not work.
  emphasisRegexpComponents: {
    // deviates from org mode default to allow ndash, mdash, and
    // quotes (’“”)
    pre: '-–—\\s\u200b\\(\'’"“”\\{',
    // deviates from org mode default to allow ndash, mdash, and
    // quotes (’“”)
    post: '-–—\\s\u200b.,:!?;\'’"“”\\)\\}\\[',
    border: '\\s\u200b',
    body: '.',
    newline: 1,
  },
  linkTypes: ['https', 'http'],
  matchSexpDepth: 3,
};

export function orgParse(this: any) {
  const parser: Parser<OrgNode> = (_doc, file) => uparse(file, options);
  Object.assign(this, { Parser: parser });
}

const postsDirectory = path.join(process.cwd(), 'posts');
const hiddenCategories = ['share', 'blog'];

type PostId = {
  params: { id: string };
};

export type EntryType = 'normal' | 'hatena' | 'qiita';

export class Entry {
  id!: string;
  title!: string;
  categories!: string[];
  date!: string;
  image?: string;
  published!: boolean;
  content!: string;
  type!: EntryType;
  externalURL?: string;
  visibleCategories!: string[];
}

export function getAllEntryIds(): PostId[] {
  const paths = getAllEntryPaths().filter((p) => p.includes('/blog/'));
  return paths.map((entryPath) => {
    return {
      params: {
        id: entryPath.endsWith('.org')
          ? getOrgEntryId(entryPath)
          : getEntryIdFromPath(entryPath),
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
    // Only include files named 'content.*'
    if (path.basename(fullPath).startsWith('content.')) {
      paths.push(fullPath);
    }
  }
  return paths;
};

export async function listEntries(
  limit: number | undefined = undefined,
): Promise<Entry[]> {
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
    (postPath) =>
      getEntryIdFromPath(postPath) === id || getOrgEntryId(postPath) === id,
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

const convertToDateTime = (dateString: string): Date => {
  const format = dateString.includes(' ') ? 'yyyy-MM-dd HH:mm' : 'yyyy-MM-dd';
  const parsedDate = parse(dateString, format, new Date());
  return convertToTimeZone(parsedDate, { timeZone: 'Asia/Tokyo' });
};

type OrgMetadata = {
  title: string;
  date: string;
  tags: string;
  image?: string;
  draft?: string;
};

const getOrgEntryId = (fullPath: string): string => {
  const parsedPath = path.parse(fullPath);
  return parsedPath.dir.split('/').pop() as string;
};

const getEntryIdFromPath = (fullPath: string): string => {
  // For new structure: posts/[year]/[slug]/content.[ext]
  // Extract the slug from the directory name
  const parsedPath = path.parse(fullPath);
  return parsedPath.dir.split('/').pop() as string;
};

const loadOrg = async (
  fullPath: string,
  includeBody = false,
): Promise<Entry> => {
  const processor = unified()
    .use(orgParse)
    .use(extractKeywords)
    .use(uniorg2rehype)
    .use(rehypeRaw)
    .use(stringify);

  const res = await processor.process(fs.readFileSync(fullPath, 'utf8'));
  const metadata = res.data as OrgMetadata;
  const postDate = convertToDateTime(metadata.date);
  const categories = metadata.tags.split(' ');
  const isDraft = metadata.draft === 'true';
  const slug = getOrgEntryId(fullPath);

  return {
    id: slug,
    title: metadata.title,
    categories: categories,
    date: postDate.toISOString(),
    image: metadata.image ?? '',
    content: includeBody ? res.value.toString() : '',
    published: !isDraft,
    type: 'normal',
    externalURL: '',
    visibleCategories: categories.filter((c) => !hiddenCategories.includes(c)),
  };
};

const load = async (fullPath: string, includeBody = false): Promise<Entry> => {
  if (path.extname(fullPath) === '.org') {
    return loadOrg(fullPath, includeBody);
  }

  let fileContents: string;
  if (path.extname(fullPath) === '') {
    fileContents = fs
      .readFileSync(path.join(postsDirectory, `${fullPath}.md`), 'utf8')
      .toString();
  } else {
    fileContents = fs.readFileSync(fullPath, 'utf8');
  }

  const id = getEntryIdFromPath(fullPath);
  const matterResult = matter(fileContents);
  const content = includeBody ? matterResult.content : '';
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
  const categories = matterResult.data['category'] ?? [];

  return {
    id: id,
    title: matterResult.data['title'] || matterResult.data['Title'],
    categories: categories,
    date: date.toISOString(),
    image: matterResult.data['image'] ?? '',
    content: content,
    published: matterResult.data['published'] ?? true,
    type: checkEntryType(matterResult),
    externalURL: matterResult.data['URL'] ?? '',
    visibleCategories: categories.filter(
      (c: string) => !hiddenCategories.includes(c),
    ),
  };
};
