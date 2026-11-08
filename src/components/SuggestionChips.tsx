import { fi } from '../i18n/fi';

interface Props {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

/** Fills a field with one tap, so that one-handed typing is rarely needed. */
export default function SuggestionChips({ options, value, onChange }: Props) {
  if (options.length === 0) return null;
  const current = value.trim().toLowerCase();

  return (
    <div role="group" aria-label={fi.form.suggestions} className="-mt-2 flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = option.toLowerCase() === current;
        return (
          <button
            key={option}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(selected ? '' : option)}
            className={`min-h-11 rounded-full px-4 active:opacity-80 ${
              selected ? 'bg-wine text-white' : 'bg-wine-soft text-wine-dark'
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
