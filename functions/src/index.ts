import { Bucket } from '@google-cloud/storage';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { logger } from 'firebase-functions';
import { ObjectMetadata } from 'firebase-functions/v1/storage';
import mkdirp from 'mkdirp';
import * as os from 'os';
import * as path from 'path';
import sharp from 'sharp';
import { uuid } from 'uuidv4';

import { config, ImageSize } from './config';

sharp.cache(false);

admin.initializeApp();
logger.log('Initializing extension with configuration', config);

function resize(file: string, size: ImageSize) {
  const longSide = (() => {
    if (size === 'large') {
      return 1920;
    } else if (size === 'medium') {
      return 960;
    }
    return 480;
  })();

  return sharp(file, { failOnError: false, animated: true })
    .rotate()
    .resize(longSide, longSide, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .toBuffer();
}

const supportedContentTypes = [
  'image/jpeg',
  'image/png',
  'image/tiff',
  'image/webp',
  'image/gif',
  'image/avif',
];

const modifyImage = async ({
  bucket,
  originalFile,
  parsedPath,
  contentType,
  size,
  objectMetadata,
}: {
  bucket: Bucket;
  originalFile: string;
  parsedPath: path.ParsedPath;
  contentType: string;
  size: ImageSize;
  objectMetadata: ObjectMetadata;
}): Promise<void> => {
  const {
    ext: fileExtension,
    dir: fileDir,
    name: fileNameWithoutExtension,
  } = parsedPath;

  const modifiedFileName = `${fileNameWithoutExtension}_${size}${fileExtension}`;
  const modifiedFilePath = path.normalize(
    path.posix.join(fileDir, config.resizedImagesPath, modifiedFileName),
  );
  const modifiedFile = path.join(os.tmpdir(), modifiedFileName);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const metadata: { [key: string]: any } = {
    contentEncoding: objectMetadata.contentEncoding,
    contentLanguage: objectMetadata.contentLanguage,
    contentType: contentType,
    metadata: objectMetadata.metadata ? { ...objectMetadata.metadata } : {},
  };
  metadata.metadata.resizedImage = true;
  if (config.cacheControlHeader) {
    metadata.cacheControl = config.cacheControlHeader;
  } else {
    metadata.cacheControl = objectMetadata.cacheControl;
  }

  if (metadata.metadata.firebaseStorageDownloadTokens) {
    metadata.metadata.firebaseStorageDownloadTokens = uuid();
  }

  const modifiedImageBuffer = await resize(originalFile, size);
  logger.log(`Resized image created at '${modifiedFile}'`);
  await sharp(modifiedImageBuffer, { animated: true }).toFile(modifiedFile);

  // Uploading the modified image.
  const uploadResponse = await bucket.upload(modifiedFile, {
    destination: modifiedFilePath,
    metadata,
  });
  logger.log(`Uploaded resized image to '${modifiedFile}'`);

  await uploadResponse[0].makePublic();
};

export function shouldResize(object: ObjectMetadata): boolean {
  const { name, contentType } = object;

  if (!contentType) {
    logger.log('File has no Content-Type, no processing is required');
    return false;
  }

  if (!contentType.startsWith('image/')) {
    logger.log(`Skipping ${name} since '${contentType}' is not an image.`);
    return false;
  }

  if (object.contentEncoding === 'gzip') {
    logger.log(
      "Images encoded with 'gzip' are not supported by this extension",
    );
    return false;
  }

  if (!supportedContentTypes.includes(contentType)) {
    logger.log(
      `'${contentType}' is not supported, supported types are ${supportedContentTypes.join(
        ', ',
      )}`,
    );
    return false;
  }

  if (object.metadata && object.metadata.resizedImage === 'true') {
    logger.log(`Skipping ${name} since the file is already resized.`);
    return false;
  }

  return true;
}

const generateResizedImageHandler = async (
  object: ObjectMetadata,
): Promise<void> => {
  logger.log('Start resizing image');
  if (!shouldResize(object)) {
    return;
  }

  const bucket = admin.storage().bucket(object.bucket);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const filePath = object.name!; // File path in the bucket.
  const parsedPath = path.parse(filePath);
  const objectMetadata = object;

  const localOriginalFile = path.join(os.tmpdir(), filePath);
  const tempLocalDir = path.dirname(localOriginalFile);

  await mkdirp(tempLocalDir);
  logger.log(`Created temporary directory: '${tempLocalDir}'`);

  const remoteOriginalFile = bucket.file(filePath);
  await remoteOriginalFile.download({ destination: localOriginalFile });
  logger.log(`Downloaded ${filePath} to '${localOriginalFile}'`);

  const tasks = (config.imageSizes as ImageSize[]).map((size) => {
    return modifyImage({
      bucket,
      originalFile: localOriginalFile,
      parsedPath,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      contentType: object.contentType!,
      size,
      objectMetadata: objectMetadata,
    });
  });
  await Promise.all(tasks);
};

export const generateResizedImage = functions
  .region('asia-northeast1')
  .runWith({ memory: '2GB', timeoutSeconds: 300 })
  .storage.bucket(config.bucket)
  .object()
  .onFinalize(async (object) => {
    await generateResizedImageHandler(object);
  });
