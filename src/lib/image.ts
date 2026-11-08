import imageCompression from 'browser-image-compression';
import type { WinePhotos } from './wineForm';

// useWebWorker must stay false: in worker mode the library downloads itself from a
// CDN at runtime, which would break the app's offline and no-network rules.
const shared = { fileType: 'image/jpeg', initialQuality: 0.75, useWebWorker: false } as const;

export const PHOTO_OPTIONS = { ...shared, maxWidthOrHeight: 1200, maxSizeMB: 0.3 } as const;
export const THUMB_OPTIONS = { ...shared, maxWidthOrHeight: 300, maxSizeMB: 0.05 } as const;

async function compress(file: File, options: typeof PHOTO_OPTIONS | typeof THUMB_OPTIONS) {
  const result = await imageCompression(file, options);
  return new Blob([result], { type: 'image/jpeg' });
}

/** Creates the stored photo and list thumbnail from a picked image file. */
export async function createWinePhotos(file: File): Promise<Required<WinePhotos>> {
  const photo = await compress(file, PHOTO_OPTIONS);
  // Working from the already reduced photo keeps this quick on a phone.
  const thumb = await compress(new File([photo], file.name, { type: 'image/jpeg' }), THUMB_OPTIONS);
  return { photo, thumb };
}
