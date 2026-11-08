import type { ChangeEvent } from 'react';
import { useObjectUrl } from '../hooks/useObjectUrl';
import { fi } from '../i18n/fi';
import { CameraIcon, GalleryIcon } from './Icons';

interface Props {
  photo?: Blob;
  busy: boolean;
  failed: boolean;
  onSelect: (file: File) => void;
  onRemove: () => void;
}

export default function PhotoPicker({ photo, busy, failed, onSelect, onRemove }: Props) {
  const previewUrl = useObjectUrl(photo);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Clearing the value lets the same file be picked again after removing it.
    event.target.value = '';
    if (file) onSelect(file);
  };

  const tile = `flex items-center justify-center gap-2 rounded-2xl font-semibold active:opacity-80 has-[:disabled]:opacity-50 has-[:focus-visible]:outline-2 ${
    previewUrl ? 'min-h-12' : 'min-h-20 flex-col'
  }`;

  return (
    <section aria-label={fi.photo.title}>
      {previewUrl && (
        <img
          src={previewUrl}
          alt={fi.photo.alt}
          className="mb-2 max-h-56 w-full rounded-2xl bg-white object-cover"
        />
      )}
      {busy && (
        <p role="status" className="mb-2 font-semibold">
          {fi.photo.processing}
        </p>
      )}
      {failed && (
        <p role="alert" className="mb-2 font-semibold text-danger">
          {fi.photo.failed}
        </p>
      )}
      {/* The camera is the main choice, so it takes the wider, right-hand side. */}
      <div className="grid grid-cols-[2fr_3fr] gap-2">
        <label className={`${tile} border border-line bg-white text-ink`}>
          <GalleryIcon />
          {fi.photo.chooseFromGallery}
          <input
            type="file"
            accept="image/*"
            disabled={busy}
            onChange={handleChange}
            className="sr-only"
          />
        </label>
        <label className={`${tile} bg-wine-soft text-wine-dark`}>
          <CameraIcon />
          {photo ? fi.photo.change : fi.photo.takePhoto}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            disabled={busy}
            onChange={handleChange}
            className="sr-only"
          />
        </label>
      </div>
      {photo && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onRemove}
            disabled={busy}
            className="min-h-11 px-1 text-muted underline"
          >
            {fi.photo.remove}
          </button>
        </div>
      )}
    </section>
  );
}
