import path from 'path';

export type ImageSize = 'large' | 'medium' | 'small';

const imageUrlForPath = (imagePath: string, imageSize: ImageSize): string => {
  if (process.env.NODE_ENV === 'production') {
    const extension = path.extname(imagePath);
    const fileName = path.basename(imagePath, extension);
    const dirName = path.dirname(imagePath);
    return `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${dirName}/generated/${fileName}_${imageSize}${extension}`;
  } else {
    return imagePath;
  }
}

export function TwitterCardImage(params: {
  imagePath: string;
}): JSX.Element {
  const urlString = imageUrlForPath(params.imagePath, 'small');
  return <>
  <meta name="twitter:card" content="summary_large_image" />
  <meta
    property="og:image"
    content={urlString}
  />
</>;
}

export function Image(params: {
  imagePath: string;
  imageSize: ImageSize;
  className: string;
  alt?: string;
  showCaption?: boolean;
}): JSX.Element {
  const urlString = imageUrlForPath(params.imagePath, params.imageSize);

  const imgTag = <img src={urlString} alt={params.alt} className={params.className} />;
  if (params.showCaption === true) {
    return (
      <figure className="image-container flex flex-col">
      {imgTag}
      {params.alt ?
        <figcaption className="caption text-sm text-gray-500 text-center" aria-label={params.alt}>{params.alt}</figcaption> :
        null
      }
      </figure>
    );
  } else {
    return imgTag;
  }
}
