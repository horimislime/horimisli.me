import AdmZip from 'adm-zip';
import * as fs from 'fs';
import * as path from 'path';
import { stdin as input, stdout as output } from 'process';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as readline from 'readline/promises';

type BearNote = {
  body: string;
  images: Buffer[];
};

function loadNote(filePath: string): BearNote {
  const fileExtension = path.extname(filePath);
  console.log(process.argv);
  console.log(`ext: ${fileExtension}`);
  if (fileExtension === '.txt') {
    console.log('read text');
    const text = fs.readFileSync(filePath, { encoding: 'utf8' });
    return { body: text, images: [] };
  } else if (fileExtension === '.bearnote') {
    console.log('note with images');
    const archive = new AdmZip(filePath);
    let text = '';
    const images: Buffer[] = [];
    const zipContents = archive
      .getEntries()
      .filter((e) => !e.entryName.endsWith('.json'));
    for (const entry of zipContents) {
      console.log('archive content', entry.name);
      if (entry.name.endsWith('.txt')) {
        text = archive.readAsText(entry);
      } else {
        images.push(archive.readFile(entry));
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
  publishedAt: Date,
): string {
  const lines = content.split('\n');
  const title = lines[0].replace('# ', '').trim();
  const header = `---
  layout: post
  title: ${title}
  date: ${publishedAt.toISOString()}
  categories: [${categories.map((e) => `"${e}"`).join(', ')}]
  published: false
  ---

  `;

  const output: string[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('[assets/')) {
      const formatted = line.replace('[assets/', '![](/images/');
      output.push(formatted);
    } else {
      output.push(line);
    }
  }
  return header + output.join('\n');
}

(async () => {
  console.log('hello');
  const filePath = process.argv[2];

  const rl = readline.createInterface({ input, output });
  const slug = await rl.question('slug:');
  const categories = await rl.question('categories (comma separated):');
  rl.close();
  console.log(`File name will be posts/${slug}.md`);

  const note = loadNote(filePath);
  const markdown = formatAsMarkdown(
    note.body,
    categories.split(',').map((e) => e.trim()),
    new Date(),
  );
  fs.writeFileSync(`posts/${slug}.md`, markdown);
  console.log(note);
})();
