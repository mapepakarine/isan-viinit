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
      <div role="group" aria-label={fi.rating.label} className="flex">
        {VALUES.map((star) => {
          const filled = value !== undefined && star <= value;
          return (
            <button
              key={star}
              type="button"
              aria-label={fi.rating.star(star)}
              aria-pressed={value === star}
              onClick={() => onChange(star)}
              className={`flex h-14 flex-1 items-center justify-center text-[2.5rem] leading-none active:opacity-70 ${
                filled ? 'text-wine' : 'text-star-empty'
              }`}
            >
              ★
            </button>
          );
        })}
      </div>
      {value !== undefined && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="min-h-11 px-1 text-muted underline"
          >
            {fi.rating.clear}
          </button>
        </div>
      )}
    </div>
  );
}
