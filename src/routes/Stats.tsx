import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { primaryButton } from '../components/buttonStyles';
import StatBars from '../components/StatBars';
import { db } from '../db/db';
import type { Wine } from '../db/types';
import { fi } from '../i18n/fi';
import { formatDecimal, formatPrice } from '../lib/format';
import { computeStats } from '../lib/stats';

const heading = <h1 className="font-display text-3xl font-semibold">{fi.titles.stats}</h1>;

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-muted">{label}</dt>
      <dd className="font-display text-[1.6rem] leading-tight font-semibold">{value}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-line pt-4">
      <h2 className="mb-2 font-display text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

/** Each row opens the wine; "from" lets its card return here instead of to the list. */
function WineRows({ wines, detail }: { wines: Wine[]; detail: (wine: Wine) => string }) {
  return (
    <ol>
      {wines.map((wine) => (
        <li key={wine.id} className="border-b border-line last:border-b-0">
          <Link
            to={`/wines/${wine.id}`}
            state={{ from: '/stats' }}
            className="flex min-h-12 items-center justify-between gap-3 py-2 active:opacity-70"
          >
            <span className="min-w-0 font-medium break-words">{wine.name}</span>
            <span className="shrink-0 text-muted">{detail(wine)}</span>
          </Link>
        </li>
      ))}
    </ol>
  );
}

export default function Stats() {
  const wines = useLiveQuery(() => db.wines.toArray());
  const stats = useMemo(() => computeStats(wines ?? []), [wines]);

  if (wines === undefined) {
    return (
      <>
        {heading}
        <p className="mt-3 text-muted">{fi.loading}</p>
      </>
    );
  }

  if (stats.total === 0) {
    return (
      <>
        {heading}
        <p className="mt-3 text-muted">{fi.stats.empty}</p>
        <Link to="/wines/new" className={`${primaryButton} mt-6`}>
          {fi.home.addFirst}
        </Link>
      </>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {heading}

      <dl className="grid grid-cols-3 gap-3">
        <Tile label={fi.stats.total} value={String(stats.total)} />
        <Tile
          label={fi.stats.averageRating}
          value={stats.averageRating === undefined ? '–' : `★${formatDecimal(stats.averageRating)}`}
        />
        <Tile
          label={fi.stats.averagePrice}
          value={stats.averagePrice === undefined ? '–' : formatPrice(stats.averagePrice)}
        />
      </dl>

      {stats.topWines.length > 0 && (
        <Section title={fi.stats.topWines}>
          <WineRows wines={stats.topWines} detail={(wine) => `★${wine.rating}`} />
        </Section>
      )}

      {stats.grapes.length > 0 && (
        <Section title={fi.stats.grapes}>
          <StatBars groups={stats.grapes} />
        </Section>
      )}

      {stats.countries.length > 0 && (
        <Section title={fi.stats.countries}>
          <StatBars groups={stats.countries} />
        </Section>
      )}

      {stats.bestValue.length > 0 && (
        <Section title={fi.stats.bestValue}>
          <WineRows
            wines={stats.bestValue}
            detail={(wine) => `★${wine.rating} · ${formatPrice(wine.price!)}`}
          />
        </Section>
      )}
    </div>
  );
}
