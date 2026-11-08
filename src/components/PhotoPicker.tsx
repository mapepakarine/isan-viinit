import type { ChangeEvent } from 'react';
import { useObjectUrl } from '../hooks/useObjectUrl';
import { fi } from '../i18n/fi';

interface Props {
  photo?: Blob;
  busy: boolean;
  failed: boolean;
  onSelect: (file: File) => void;
  onRemove: () => void;
}

const button =
  'flex min-h-12 flex-1 cursor-pointer items-center justify-center rounded-lg border border-wine px-3 text-center font-semibold text-wine focus-within:outline-2 has-[:disabled]:opacity-50';

export default function PhotoPicker({ photo, busy, failed, onSelect, onRemove }: Props) {
  const previewUrl = useObjectUrl(photo);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Clearing the value lets the same file be picked again after removing it.
    event.target.value = '';
    if (file) onSelect(file);
  };

  return (
    <section aria-label={fi.photo.title}>
      {previewUrl && (
        <img
          src={previewUrl}
          alt={fi.photo.alt}
          className="mb-2 max-h-72 w-full rounded-lg bg-white object-contain"
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
      <div className="flex gap-2">
        <label className={button}>
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
        <label className={button}>
          {fi.photo.chooseFromGallery}
          <input
            type="file"
            accept="image/*"
            disabled={busy}
            onChange={handleChange}
            className="sr-only"
          />
        </label>
      </div>
      {photo && (
        <button
          type="button"
          onClick={onRemove}
          disabled={busy}
          className="mt-1 min-h-11 font-semibold text-wine underline"
        >
          {fi.photo.remove}
        </button>
      )}
    </section>
  );
}
