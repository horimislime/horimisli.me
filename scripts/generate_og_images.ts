import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { getAllEntryIds, findEntryById, listEntries } from '../src/entities/Entry';

interface EntryData {
  id: string;
  title?: string;
}

// posts/blog 下の全ての記事のIDリストを取得
const getEntryIds = async (): Promise<EntryData[]> => {
  const entries = await listEntries();
  
  return entries
    .filter(entry => entry.published && entry.type === 'normal')
    .map(entry => ({
      id: entry.id,
      title: entry.title,
    }));
};

const wrapText = (text: string, maxCharsPerLine: number): string[] => {
  // 日本語と英語の混在テキストに対応
  const lines: string[] = [];
  let currentLine = '';
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const testLine = currentLine + char;
    
    // 日本語文字は2文字分として計算
    const lineLength = Array.from(testLine).reduce((len, c) => {
      return len + (c.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/) ? 2 : 1);
    }, 0);
    
    if (lineLength <= maxCharsPerLine) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = char;
      } else {
        lines.push(char);
      }
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines.slice(0, 4); // 最大4行まで
};

const calculateMaxCharsPerLine = (title: string): number => {
  const titleLength = Array.from(title).reduce((len, c) => {
    return len + (c.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/) ? 2 : 1);
  }, 0);
  
  if (titleLength <= 20) {
    return 20; // 1行で表示
  } else if (titleLength <= 50) {
    return 25; // 2行で表示
  } else if (titleLength <= 90) {
    return 30; // 3行で表示
  } else {
    return 35; // 4行で表示
  }
};

const generateOGImageSVG = (entry: EntryData): string => {
  const title = entry.title || `Entry: ${entry.id}`;
  const fontSize = 48; // 固定フォントサイズ
  const maxChars = calculateMaxCharsPerLine(title);
  const titleLines = wrapText(title, maxChars);

  // 行数に応じてY位置を調整
  const lineHeight = fontSize + 16;
  const totalHeight = titleLines.length * lineHeight;
  const startY = 350 - totalHeight / 2 + lineHeight / 2;

  const titleElements = titleLines
    .map(
      (line, index) =>
        `<text x="600" y="${startY + index * lineHeight}" text-anchor="middle" dominant-baseline="middle" class="title" fill="#333">${line}</text>`,
    )
    .join('');

  return `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          .title { font-family: "Noto Sans JP", Arial, sans-serif; font-size: ${fontSize}px; font-weight: 700; }
          .author { font-family: "Noto Sans JP", Arial, sans-serif; font-size: 24px; font-weight: 400; }
        </style>
      </defs>
      <!-- 背景 -->
      <rect width="1200" height="630" fill="#ffffff"/>
      
      <!-- アイコン（左上） -->
      <circle cx="100" cy="100" r="40" fill="#f0f0f0" stroke="#ddd" stroke-width="2"/>
      
      <!-- 筆者ID -->
      <text x="160" y="110" class="author" fill="#666">@horimislime</text>
      
      <!-- タイトル（中央・複数行対応） -->
      ${titleElements}
    </svg>
  `;
};

const generateOGImage = async (entry: EntryData): Promise<Buffer> => {
  const svgString = generateOGImageSVG(entry);

  // プロフィール画像を読み込み
  const profileImagePath = path.join(
    process.cwd(),
    'public/images',
    'og_profile.jpg',
  );
  let compositeImages = [];

  if (fs.existsSync(profileImagePath)) {
    // プロフィール画像を80x80にリサイズして円形にマスク
    const profileImage = await sharp(profileImagePath)
      .resize(80, 80)
      .composite([
        {
          input: Buffer.from(`
          <svg width="80" height="80">
            <defs>
              <mask id="circle">
                <circle cx="40" cy="40" r="40" fill="white"/>
              </mask>
            </defs>
            <rect width="80" height="80" fill="black" mask="url(#circle)"/>
          </svg>
        `),
          blend: 'dest-in',
        },
      ])
      .png()
      .toBuffer();

    compositeImages.push({
      input: profileImage,
      top: 60,
      left: 60,
    });
  }

  const buffer = await sharp(Buffer.from(svgString))
    .composite(compositeImages)
    .png()
    .toBuffer();

  return buffer;
};

const main = async (): Promise<void> => {
  const entries = await getEntryIds();

  for (const entry of entries) {
    try {
      const outputDir = path.join(process.cwd(), 'public', 'images', entry.id);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      const imageBuffer = await generateOGImage(entry);
      const outputPath = path.join(outputDir, 'og.png');
      fs.writeFileSync(outputPath, imageBuffer);
      console.log(`Generated OG image: ${outputPath}`);
    } catch (error) {
      console.error(`Failed to generate OG image for ${entry.id}:`, error);
    }
  }
};

main().catch(console.error);
