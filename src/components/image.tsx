import path from 'path';
import type { JSX } from "react";
import url from 'url';

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
    if (fileName === 'og') {
      return `${dir}/${fileName}.png`;
    }
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
    : `https://${process.env.NEXT_PUBLIC_SITE_DOMAIN}${urlString}`;
  return (
    <>
      <meta name="twitter:card" content="summary_large_image" />
      <meta property="twitter:image" content={absoluteUrl} />
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
