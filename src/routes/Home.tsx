import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import FilterChips from '../components/FilterChips';
import SummaryCard from '../components/SummaryCard';
import WineListItem from '../components/WineListItem';
import { db } from '../db/db';
import { fi } from '../i18n/fi';
import { journalSummary } from '../lib/summaries';
import {
  filterWines,
  hasActiveFilters,
  NO_FILTERS,
  sortWines,
  type WineFilters,
  type WineSort,
} from '../lib/wineList';

// Kept outside the component so a search survives opening a wine and coming back.
let remembered: { filters: WineFilters; sort: WineSort; showFilters: boolean } = {
  filters: NO_FILTERS,
  sort: 'date',
  showFilters: false,
};

export default function Home() {
  const wines = useLiveQuery(() => db.wines.toArray());
  const [filters, setFilters] = useState(remembered.filters);
  const [sort, setSort] = useState(remembered.sort);
  const [showFilters, setShowFilters] = useState(remembered.showFilters);

  useEffect(() => {
    remembered = { filters, sort, showFilters };
  }, [filters, sort, showFilters]);

  const visible = useMemo(
    () => (wines ? sortWines(filterWines(wines, filters), sort) : []),
    [wines, filters, sort],
  );
  const summary = useMemo(() => journalSummary(wines ?? [], new Date()), [wines]);

  const heading = <h1 className="text-3xl font-bold text-wine">{fi.titles.home}</h1>;

  if (wines === undefined) {
    return (
      <>
        {heading}
        <p className="mt-3 text-muted">{fi.loading}</p>
      </>
    );
  }

  if (wines.length === 0) {
    return (
      <>
        {heading}
        <p className="mt-3 text-muted">{fi.home.empty}</p>
        <Link
          to="/wines/new"
          className="mt-4 flex min-h-14 items-center justify-center rounded-lg bg-wine px-4 font-bold text-white"
        >
          {fi.home.addFirst}
        </Link>
      </>
    );
  }

  const filtering = hasActiveFilters(filters);

  return (
    <div className="flex flex-col gap-3">
      {heading}
      <SummaryCard lines={summary} />

      <label className="block">
        <span className="font-semibold">{fi.filters.search}</span>
        <input
          type="search"
          name="search"
          placeholder={fi.filters.searchPlaceholder}
          value={filters.query}
          onChange={(e) => setFilters({ ...filters, query: e.target.value })}
          className="mt-1 block min-h-12 w-full min-w-0 appearance-none rounded-lg border border-muted bg-white px-3 py-2 text-ink placeholder:text-muted"
        />
      </label>

      <button
        type="button"
        aria-expanded={showFilters}
        onClick={() => setShowFilters(!showFilters)}
        className="min-h-12 rounded-lg border border-wine px-4 font-semibold text-wine"
      >
        {showFilters ? fi.filters.hide : fi.filters.show}
      </button>

      {showFilters && (
        <FilterChips
          filters={filters}
          sort={sort}
          onFiltersChange={setFilters}
          onSortChange={setSort}
        />
      )}

      {filtering && (
        <div className="flex items-center justify-between gap-2">
          <p role="status" className="font-semibold">
            {fi.filters.showing(visible.length, wines.length)}
          </p>
          <button
            type="button"
            onClick={() => setFilters(NO_FILTERS)}
            className="min-h-11 shrink-0 font-semibold text-wine underline"
          >
            {fi.filters.clear}
          </button>
        </div>
      )}

      {visible.length === 0 ? (
        <p className="text-muted">{fi.filters.noResults}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {visible.map((wine) => (
            <WineListItem key={wine.id} wine={wine} />
          ))}
        </ul>
      )}
    </div>
  );
}
