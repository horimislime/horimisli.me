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

(async () => {
  console.log('hello');
  const filePath = process.argv[2];

  // const rl = readline.createInterface({ input, output });
  // const slug = await rl.question('slug:');
  // rl.close();
  // console.log(`File name will be posts/${slug}.md`);

  const note = loadNote(filePath);
  console.log(note);
})();
