import AdmZip from 'adm-zip';
import * as fs from 'fs';
import { DateTime } from 'luxon';
import * as path from 'path';
import { stdin as input, stdout as output } from 'process';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as readline from 'readline/promises';

type Image = {
  fileName: string;
  data: Buffer;
};

type BearNote = {
  body: string;
  images: Image[];
};

function loadNote(filePath: string): BearNote {
  const fileExtension = path.extname(filePath);
  if (fileExtension === '.txt') {
    const text = fs.readFileSync(filePath, { encoding: 'utf8' });
    return { body: text, images: [] };
  } else if (fileExtension === '.bearnote') {
    const archive = new AdmZip(filePath);
    let text = '';
    const images: Image[] = [];
    const zipContents = archive
      .getEntries()
      .filter((e) => !e.entryName.endsWith('.json'));
    for (const entry of zipContents) {
      if (entry.name.endsWith('.txt')) {
        text = archive.readAsText(entry);
      } else {
        images.push({ fileName: entry.name, data: archive.readFile(entry) });
      }
    }
    return { body: text, images };
  } else {
    console.log('invalid file format');
    return { body: '', images: [] };
  }
}

function formatAsMarkdown(
  content: string,
  categories: string[],
  publishedAt: DateTime,
): string {
  const lines = content.split('\n');
  const title = lines[0].replace('# ', '').trim();
  const header = `---
layout: post
title: ${title}
date: ${publishedAt.toFormat('yyyy-MM-dd HH:mm')}
category: [${categories.map((e) => `'${e}'`).join(', ')}]
published: false
---
`;

  const output: string[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('[assets/')) {
      const formatted = line.replace(/\[assets\/(.+)\]/g, (_, imagePath) => {
        return `![](/images/${publishedAt.year}/${imagePath})`;
      });
      output.push(formatted);
    } else {
      output.push(line);
    }
  }
  return header + output.join('\n');
}

(async () => {
  const filePath = process.argv[2];

  const rl = readline.createInterface({ input, output });
  const slug = await rl.question('slug:');
  const categories = await rl.question('categories (comma separated):');
  rl.close();

  console.log(`File name will be posts/${slug}.md`);
  const now = DateTime.now();
  const note = loadNote(filePath);
  const markdown = formatAsMarkdown(
    note.body,
    categories.split(',').map((e) => e.trim()),
    now,
  );
  const entryPath = `posts/blog/${now.year}/${slug}.md`;
  fs.writeFileSync(entryPath, markdown);

  console.log(`wrote ${entryPath}`);

  const imageDir = `public/images/${now.year}`;
  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir);
    console.log(`created ${imageDir}`);
  }

  for (const image of note.images) {
    const imagePath = `${imageDir}/${image.fileName}`;
    fs.writeFileSync(imagePath, image.data);
    console.log(`wrote ${imagePath}`);
  }
})();
