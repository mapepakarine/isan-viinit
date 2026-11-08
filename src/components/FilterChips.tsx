import type { ReactNode } from 'react';
import type { WineType } from '../db/types';
import { fi } from '../i18n/fi';
import type { WineFilters, WineSort } from '../lib/wineList';

const WINE_TYPES: WineType[] = ['red', 'white', 'rose', 'sparkling', 'dessert', 'other'];
const SORTS: WineSort[] = ['date', 'rating', 'price'];

function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`min-h-11 rounded-full border px-4 font-semibold ${
        selected ? 'border-wine bg-wine text-white' : 'border-muted bg-white text-ink'
      }`}
    >
      {selected && <span aria-hidden="true">✓ </span>}
      {children}
    </button>
  );
}

interface Props {
  filters: WineFilters;
  sort: WineSort;
  onFiltersChange: (filters: WineFilters) => void;
  onSortChange: (sort: WineSort) => void;
}

export default function FilterChips({ filters, sort, onFiltersChange, onSortChange }: Props) {
  const toggleType = (type: WineType) =>
    onFiltersChange({
      ...filters,
      types: filters.types.includes(type)
        ? filters.types.filter((current) => current !== type)
        : [...filters.types, type],
    });

  return (
    <div className="flex flex-col gap-3">
      <div role="group" aria-label={fi.filters.filterBy}>
        <p className="font-semibold">{fi.filters.filterBy}</p>
        <div className="mt-1 flex flex-wrap gap-2">
          {WINE_TYPES.map((type) => (
            <Chip
              key={type}
              selected={filters.types.includes(type)}
              onClick={() => toggleType(type)}
            >
              {fi.wineTypes[type]}
            </Chip>
          ))}
          <Chip
            selected={filters.topRated}
            onClick={() => onFiltersChange({ ...filters, topRated: !filters.topRated })}
          >
            {fi.filters.topRated}
          </Chip>
          <Chip
            selected={filters.buyAgain}
            onClick={() => onFiltersChange({ ...filters, buyAgain: !filters.buyAgain })}
          >
            {fi.filters.buyAgain}
          </Chip>
        </div>
      </div>
      <div role="group" aria-label={fi.filters.sortBy}>
        <p className="font-semibold">{fi.filters.sortBy}</p>
        <div className="mt-1 flex flex-wrap gap-2">
          {SORTS.map((option) => (
            <Chip key={option} selected={sort === option} onClick={() => onSortChange(option)}>
              {fi.filters.sorts[option]}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}
