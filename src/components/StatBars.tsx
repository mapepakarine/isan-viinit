import { fi } from '../i18n/fi';
import { formatDecimal } from '../lib/format';
import type { GroupStats } from '../lib/stats';

/** Ranked counts: bar length shows the number of wines, and every row states its value. */
export default function StatBars({ groups }: { groups: GroupStats[] }) {
  const largest = Math.max(...groups.map((group) => group.count));
  // A single bar compares nothing, so the numbers are enough.
  const showBars = groups.length > 1;

  return (
    <ul className="flex flex-col gap-3">
      {groups.map(({ name, count, averageRating }) => (
        <li key={name}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="min-w-0 font-medium break-words">{name}</span>
            <span className="shrink-0 text-muted">
              {fi.stats.wineCount(count)}
              {averageRating !== undefined && ` · ★${formatDecimal(averageRating)}`}
            </span>
          </div>
          {showBars && (
            <div
              aria-hidden="true"
              data-bar
              className="mt-1 h-2 rounded-r bg-bar"
              style={{ width: `${(count / largest) * 100}%` }}
            />
          )}
        </li>
      ))}
    </ul>
  );
}
