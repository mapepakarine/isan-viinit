import type { Rating } from '../db/types';
import { fi } from '../i18n/fi';

const VALUES: Rating[] = [1, 2, 3, 4, 5];

interface Props {
  value?: Rating;
  onChange: (value: Rating | undefined) => void;
}

export default function StarRating({ value, onChange }: Props) {
  return (
    <div>
      <div role="group" aria-label={fi.rating.label} className="flex gap-1">
        {VALUES.map((star) => {
          const filled = value !== undefined && star <= value;
          return (
            <button
              key={star}
              type="button"
              aria-label={fi.rating.star(star)}
              aria-pressed={value === star}
              onClick={() => onChange(star)}
              className={`flex h-14 flex-1 items-center justify-center rounded-lg border text-3xl ${
                filled ? 'border-wine bg-wine text-white' : 'border-line bg-white text-muted'
              }`}
            >
              {filled ? '★' : '☆'}
            </button>
          );
        })}
      </div>
      {value !== undefined && (
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="mt-1 min-h-11 font-semibold text-wine underline"
        >
          {fi.rating.clear}
        </button>
      )}
    </div>
  );
}
