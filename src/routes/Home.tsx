import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { primaryButton } from '../components/buttonStyles';
import FilterSheet from '../components/FilterSheet';
import { ChevronIcon } from '../components/Icons';
import SummaryCard from '../components/SummaryCard';
import WineListItem from '../components/WineListItem';
import { db } from '../db/db';
import { getLastBackupAt } from '../db/operations';
import { fi } from '../i18n/fi';
import { backupReminderDue } from '../lib/backupReminder';
import { journalSummary } from '../lib/summaries';
import {
  activeFilterCount,
  filterWines,
  hasActiveFilters,
  NO_FILTERS,
  sortWines,
  type WineFilters,
  type WineSort,
} from '../lib/wineList';

// Kept outside the component so a search and the scroll position survive opening a
// wine and coming back, which saves scrolling the list again with one thumb.
const remembered: { filters: WineFilters; sort: WineSort; scrollY: number } = {
  filters: NO_FILTERS,
  sort: 'date',
  scrollY: 0,
};

export default function Home() {
  const wines = useLiveQuery(() => db.wines.toArray());
  const lastBackupAt = useLiveQuery(getLastBackupAt);
  const [filters, setFilters] = useState(remembered.filters);
  const [sort, setSort] = useState(remembered.sort);
  const [showFilters, setShowFilters] = useState(false);
  // Waiting for both means the backup reminder can't push the list down after it has appeared.
  const loaded = wines !== undefined && lastBackupAt !== undefined;

  useEffect(() => {
    remembered.filters = filters;
    remembered.sort = sort;
  }, [filters, sort]);

  // A layout effect's cleanup runs before the next screen replaces this one, so scrollY is
  // still the position the user left the list at.
  useLayoutEffect(() => {
    if (!loaded) return;
    window.scrollTo(0, remembered.scrollY);
    return () => {
      remembered.scrollY = window.scrollY;
    };
  }, [loaded]);

  const visible = useMemo(
    () => (wines ? sortWines(filterWines(wines, filters), sort) : []),
    [wines, filters, sort],
  );
  const summary = useMemo(() => journalSummary(wines ?? [], new Date()), [wines]);

  const heading = <h1 className="font-display text-3xl font-semibold">{fi.titles.home}</h1>;

  if (!loaded) {
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
        <Link to="/wines/new" className={`${primaryButton} mt-6`}>
          {fi.home.addFirst}
        </Link>
      </>
    );
  }

  const filterCount = activeFilterCount(filters);

  return (
    <div className="flex flex-col gap-3 pb-20">
      {heading}
      <SummaryCard lines={summary} />

      {backupReminderDue(lastBackupAt, wines, new Date()) && (
        <Link
          to="/settings"
          className="flex min-h-12 items-center justify-between gap-3 rounded-2xl bg-wine-soft px-4 py-2 text-wine-dark active:opacity-80"
        >
          {lastBackupAt ? fi.backup.reminder : fi.backup.reminderNever}
          <ChevronIcon className="h-6 w-6 shrink-0 -rotate-90" />
        </Link>
      )}

      {visible.length === 0 ? (
        <p className="text-muted">{fi.filters.noResults}</p>
      ) : (
        <ul>
          {visible.map((wine) => (
            <WineListItem key={wine.id} wine={wine} />
          ))}
        </ul>
      )}

      {/* Search lives above the bottom menu, within reach of the thumb at any scroll position. */}
      <div className="fixed inset-x-0 bottom-[calc(4rem+1px+max(0.5rem,env(safe-area-inset-bottom)))] z-10 mx-auto max-w-[430px] bg-cream px-3 pt-2 pb-1">
        {hasActiveFilters(filters) && (
          <div className="flex items-center justify-between gap-2 px-1 pb-1">
            <p role="status" className="text-muted">
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
        <div className="flex items-center gap-2">
          <input
            type="search"
            name="search"
            aria-label={fi.filters.search}
            placeholder={fi.filters.searchPlaceholder}
            value={filters.query}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            className="block min-h-12 w-full min-w-0 flex-1 appearance-none rounded-full border border-line bg-white px-4 text-ink placeholder:text-muted"
          />
          <button
            type="button"
            onClick={() => setShowFilters(true)}
            className={`flex min-h-12 shrink-0 items-center gap-2 rounded-full border px-4 font-semibold active:opacity-80 ${
              filterCount > 0 ? 'border-wine bg-wine text-white' : 'border-line bg-white text-ink'
            }`}
          >
            {fi.filters.open}
            {filterCount > 0 && <span>({filterCount})</span>}
          </button>
        </div>
      </div>

      {showFilters && (
        <FilterSheet
          filters={filters}
          sort={sort}
          resultCount={visible.length}
          onFiltersChange={setFilters}
          onSortChange={setSort}
          onClearFilters={() => setFilters({ ...NO_FILTERS, query: filters.query })}
          onClose={() => setShowFilters(false)}
        />
      )}
    </div>
  );
}
