import { useEffect, useRef, type MouseEvent } from 'react';
import { fi } from '../i18n/fi';
import type { WineFilters, WineSort } from '../lib/wineList';
import { primaryButton, secondaryButton } from './buttonStyles';
import FilterChips from './FilterChips';

interface Props {
  filters: WineFilters;
  sort: WineSort;
  resultCount: number;
  onFiltersChange: (filters: WineFilters) => void;
  onSortChange: (sort: WineSort) => void;
  onClearFilters: () => void;
  onClose: () => void;
}

/** Slides up from the bottom so every choice is within reach of the thumb. */
export default function FilterSheet({
  filters,
  sort,
  resultCount,
  onFiltersChange,
  onSortChange,
  onClearFilters,
  onClose,
}: Props) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = dialog.current;
    if (element && !element.open) element.showModal();
  }, []);

  // A tap on the dimmed area outside the sheet lands on the dialog element itself.
  const handleClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialog.current) onClose();
  };

  return (
    <dialog
      ref={dialog}
      aria-label={fi.filters.title}
      onClose={onClose}
      onClick={handleClick}
      className="mx-auto mt-auto mb-0 max-h-[85dvh] w-full max-w-[430px] rounded-t-3xl bg-cream p-0 text-ink backdrop:bg-black/40"
    >
      <div className="px-4 pt-5 pb-3">
        <h2 className="font-display text-2xl font-semibold">{fi.filters.title}</h2>
        <div className="mt-3">
          <FilterChips
            filters={filters}
            sort={sort}
            onFiltersChange={onFiltersChange}
            onSortChange={onSortChange}
          />
        </div>
      </div>
      <div className="sticky bottom-0 flex gap-2 border-t border-line bg-cream px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <button type="button" onClick={onClearFilters} className={`${secondaryButton} flex-1`}>
          {fi.filters.clearFilters}
        </button>
        <button type="button" onClick={onClose} className={`${primaryButton} flex-[1.4]`}>
          {fi.filters.showResults(resultCount)}
        </button>
      </div>
    </dialog>
  );
}
