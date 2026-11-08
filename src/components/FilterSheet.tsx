import { fi } from '../i18n/fi';
import type { WineFilters, WineSort } from '../lib/wineList';
import BottomSheet from './BottomSheet';
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

export default function FilterSheet({
  filters,
  sort,
  resultCount,
  onFiltersChange,
  onSortChange,
  onClearFilters,
  onClose,
}: Props) {
  return (
    <BottomSheet
      title={fi.filters.title}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClearFilters} className={`${secondaryButton} flex-1`}>
            {fi.filters.clearFilters}
          </button>
          <button type="button" onClick={onClose} className={`${primaryButton} flex-[1.4]`}>
            {fi.filters.showResults(resultCount)}
          </button>
        </>
      }
    >
      <FilterChips
        filters={filters}
        sort={sort}
        onFiltersChange={onFiltersChange}
        onSortChange={onSortChange}
      />
    </BottomSheet>
  );
}
