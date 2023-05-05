export type ImageSize = 'large' | 'medium' | 'small';

export const config = {
  // bucket: process.env.IMG_BUCKET,
  bucket: 'horimislime-static',
  cacheControlHeader: process.env.CACHE_CONTROL_HEADER,
  imageSizes: ['large', 'small'],
  resizedImagesPath: 'generated',
};
