import { ObjectMetadata } from 'firebase-functions/v1/storage';

import * as logs from './logs';
import { supportedContentTypes } from './resize-image';

export function shouldResize(object: ObjectMetadata): boolean {
  const { contentType } = object;

  if (!contentType) {
    logs.noContentType();
    return false;
  }

  if (!contentType.startsWith('image/')) {
    logs.contentTypeInvalid(contentType);
    return false;
  }

  if (object.contentEncoding === 'gzip') {
    logs.gzipContentEncoding();
    return false;
  }

  if (!supportedContentTypes.includes(contentType)) {
    logs.unsupportedType(supportedContentTypes, contentType);
    return false;
  }

  if (object.metadata && object.metadata.resizedImage === 'true') {
    logs.imageAlreadyResized();
    return false;
  }

  return true;
}
