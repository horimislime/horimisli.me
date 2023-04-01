import path from 'path';

export type ImageSize = 'large' | 'medium' | 'small';

export function Image(params: {
  imagePath: string;
  imageSize: ImageSize;
  className: string;
  alt?: string;
  showCaption?: boolean;
}): JSX.Element {
  const urlString = (() => {
    if (process.env.NODE_ENV === 'production') {
      const extension = path.extname(params.imagePath);
      const fileName = path.basename(params.imagePath, extension);
      const dirName = path.dirname(params.imagePath);
      return `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${dirName}/generated/${fileName}_${params.imageSize}${extension}`;
    } else {
      return params.imagePath;
    }
  })();

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
