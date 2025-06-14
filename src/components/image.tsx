import path from 'path';
import url from 'url';

import type { JSX } from "react";

export type ImageSize = 'large' | 'medium' | 'small';

const imageUrlForPath = (
  imagePath: string,
  imageSize: ImageSize,
  slug?: string,
): string => {
  if (
    imagePath.startsWith('https') &&
    url.parse(imagePath).hostname != process.env.NEXT_PUBLIC_SITE_DOMAIN
  ) {
    return imagePath;
  }

  const extension = path.extname(imagePath);
  const fileName = path.basename(imagePath, extension);
  const dir = path.dirname(imagePath);
  if (dir === '.' || dir === '' || dir === '/') {
    return `/images/${slug}/${fileName}_${imageSize}.webp`;
  } else {
    return `${dir}/${fileName}_${imageSize}.webp`;
  }
};

export function TwitterCardImage(params: {
  imagePath: string;
  slug?: string;
}): JSX.Element {
  const urlString = imageUrlForPath(params.imagePath, 'small', params.slug);
  const absoluteUrl = urlString.startsWith('http') 
    ? urlString 
    : `${process.env.NEXT_PUBLIC_SITE_URL || 'https://horimisli.me'}${urlString}`;
  return (
    <>
      <meta name="twitter:card" content="summary_large_image" />
      <meta property="og:image" content={absoluteUrl} />
    </>
  );
}

export function Image(params: {
  imagePath: string;
  imageSize: ImageSize;
  className: string;
  alt?: string;
  showCaption?: boolean;
  slug?: string;
}): JSX.Element {
  const urlString = imageUrlForPath(
    params.imagePath,
    params.imageSize,
    params.slug,
  );

  // eslint-disable-next-line @next/next/no-img-element
  const imgTag = (
    <img src={urlString} alt={params.alt} className={params.className} />
  );
  if (params.showCaption === true) {
    return (
      <figure className="image-container flex flex-col">
        {imgTag}
        {params.alt ? (
          <figcaption
            className="caption text-sm text-gray-500 text-center"
            aria-label={params.alt}
          >
            {params.alt}
          </figcaption>
        ) : null}
      </figure>
    );
  } else {
    return imgTag;
  }
}
