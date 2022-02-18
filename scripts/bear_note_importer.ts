import * as path from 'path';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

export {};

type BearNote = {
  body: string;
  images: BinaryType[];
};

function readBearNote(filePath: string): BearNote {
  return { body: '', images: [] };
}

(async () => {
  console.log('hello');
  // const filePath = process.argv[2];
  // const fileExtension = path.extname(filePath);
  // console.log(process.argv);
  // console.log(`ext: ${fileExtension}`);
  // if (fileExtension === '.txt') {
  //   console.log('read text');
  // } else if (fileExtension === '.bearnote') {
  //   console.log('note with images');
  // } else {
  //   console.log('invalid file format');
  // }

  const rl = readline.createInterface({ input, output });

  const slug = await rl.question('slug:');

  console.log(`File name will be posts/${slug}.md`);

  rl.close();
})();
