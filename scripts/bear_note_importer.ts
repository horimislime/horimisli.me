import * as path from 'path';

export {};

type BearNote = {
  body: string;
  images: BinaryType[];
};

function readBearNote(filePath: string): BearNote {
  return { body: '', images: [] };
}

const main = () => {
  console.log('hello');
  const filePath = process.argv[2];
  const fileExtension = path.extname(filePath);
  console.log(process.argv);
  console.log(`ext: ${fileExtension}`);
  if (fileExtension === '.txt') {
    console.log('read text');
  } else if (fileExtension === '.bearnote') {
    console.log('note with images');
  } else {
    console.log('invalid file format');
  }
};

main();
