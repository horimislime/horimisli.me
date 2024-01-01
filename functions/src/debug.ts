import { resize } from './index';
import sharp from 'sharp';

(async () => {
  const modifiedImageBuffer = await resize('../public/images/2023/sc_tasks_org.png', 'large');
  await sharp(modifiedImageBuffer, { animated: true }).toFile('./test_out.webp');
})();
