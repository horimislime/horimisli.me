import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { ObjectMetadata } from 'firebase-functions/v1/storage';
import * as mkdirp from 'mkdirp';
import * as os from 'os';
import * as path from 'path';
import * as sharp from 'sharp';

import { config, ImageSize } from './config';
import { shouldResize } from './filters';
import * as logs from './logs';
import { modifyImage, ResizedImageResult } from './resize-image';

sharp.cache(false);

admin.initializeApp();
logs.init();

const generateResizedImageHandler = async (
  object: ObjectMetadata,
  verbose = true,
): Promise<void> => {
  !verbose || logs.start();
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

  // Create the temp directory where the storage file will be downloaded.
  !verbose || logs.tempDirectoryCreating(tempLocalDir);
  await mkdirp(tempLocalDir);
  !verbose || logs.tempDirectoryCreated(tempLocalDir);

  // Download file from bucket.
  const remoteOriginalFile = bucket.file(filePath);
  !verbose || logs.imageDownloading(filePath);
  await remoteOriginalFile.download({ destination: localOriginalFile });
  !verbose || logs.imageDownloaded(filePath, localOriginalFile);

  // Convert to a set to remove any duplicate sizes
  const imageSizes = new Set(config.imageSizes as ImageSize[]);

  const tasks: Promise<ResizedImageResult>[] = [];

  imageSizes.forEach((size) => {
    tasks.push(
      modifyImage({
        bucket,
        originalFile: localOriginalFile,
        parsedPath,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        contentType: object.contentType!,
        size,
        objectMetadata: objectMetadata,
      }),
    );
  });
  await Promise.all(tasks);
};

export const generateResizedImage = functions.storage
  .object()
  .onFinalize(async (object) => {
    await generateResizedImageHandler(object);
  });
