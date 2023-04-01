import { Bucket } from '@google-cloud/storage';
import { ObjectMetadata } from 'firebase-functions/v1/storage';
import * as os from 'os';
import * as path from 'path';
import * as sharp from 'sharp';
import { uuid } from 'uuidv4';

import { config, ImageSize } from './config';
import * as logs from './logs';

export interface ResizedImageResult {
  size: string;
  outputFilePath: string;
  success: boolean;
}

export function resize(file: string, size: ImageSize) {
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

/**
 * Supported file types
 */
export const supportedContentTypes = [
  'image/jpeg',
  'image/png',
  'image/tiff',
  'image/webp',
  'image/gif',
  'image/avif',
];

export const modifyImage = async ({
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
}): Promise<ResizedImageResult> => {
  const {
    ext: fileExtension,
    dir: fileDir,
    name: fileNameWithoutExtension,
  } = parsedPath;

  const modifiedFileName = `${fileNameWithoutExtension}_${size}${fileExtension}`;

  // Path where modified image will be uploaded to in Storage.
  const modifiedFilePath = path.normalize(
    config.resizedImagesPath
      ? path.posix.join(fileDir, config.resizedImagesPath, modifiedFileName)
      : path.posix.join(fileDir, modifiedFileName),
  );

  const modifiedFile = path.join(os.tmpdir(), modifiedFileName);

  // filename\*=utf-8''  selects any string match the filename notation.
  // [^;\s]+ searches any following string until either a space or semi-colon.
  const contentDisposition =
    objectMetadata && objectMetadata.contentDisposition
      ? objectMetadata.contentDisposition.replace(
          /(filename\*=utf-8''[^;\s]+)/,
          `filename*=utf-8''${modifiedFileName}`,
        )
      : '';

  // Cloud Storage files.
  const metadata: { [key: string]: any } = {
    contentDisposition,
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

  // If the original image has a download token, add a
  // new token to the image being resized #323
  if (metadata.metadata.firebaseStorageDownloadTokens) {
    metadata.metadata.firebaseStorageDownloadTokens = uuid();
  }

  // Generate a resized image buffer using Sharp.
  logs.imageResizing(modifiedFile, size);
  const modifiedImageBuffer = await resize(originalFile, size);
  logs.imageResized(modifiedFile);

  // Generate a image file using Sharp.
  await sharp(modifiedImageBuffer, { animated: true }).toFile(modifiedFile);

  // Uploading the modified image.
  logs.imageUploading(modifiedFilePath);
  const uploadResponse = await bucket.upload(modifiedFile, {
    destination: modifiedFilePath,
    metadata,
  });
  logs.imageUploaded(modifiedFile);

  await uploadResponse[0].makePublic();

  return { size, outputFilePath: modifiedFilePath, success: true };
};
