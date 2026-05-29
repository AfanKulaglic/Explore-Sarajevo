'use client';

import Image from 'next/image';

export type CmsThumbnailProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
};

/**
 * CMS table/preview thumbnails: uses `next/image` with `unoptimized` so arbitrary HTTPS URLs,
 * same-origin paths, and storage URLs work without maintaining a large `images.remotePatterns` list.
 * `blob:` previews use a plain `<img>` (Next/Image is unreliable for blob URLs).
 */
export function CmsThumbnail({ src, alt, width, height, className }: CmsThumbnailProps) {
  if (src.startsWith('blob:')) {
    // eslint-disable-next-line @next/next/no-img-element -- Next/Image does not support blob: URLs reliably
    return <img src={src} alt={alt} width={width} height={height} className={className} />;
  }

  return (
    <Image src={src} alt={alt} width={width} height={height} className={className} unoptimized />
  );
}
