import { Link } from 'react-router-dom';
import type { Wine } from '../db/types';
import { useObjectUrl } from '../hooks/useObjectUrl';
import { fi } from '../i18n/fi';
import { GlassIcon } from './Icons';

export default function WineListItem({ wine }: { wine: Wine }) {
  const thumbUrl = useObjectUrl(wine.thumb);
  const details = [fi.wineTypes[wine.type], wine.grape, wine.vintage].filter(Boolean).join(' · ');

  return (
    <li className="border-b border-line last:border-b-0">
      <Link to={`/wines/${wine.id}`} className="flex min-h-20 items-center gap-3 py-2 active:opacity-70">
        {thumbUrl ? (
          <img src={thumbUrl} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-wine-soft text-wine"
          >
            <GlassIcon className="h-7 w-7" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{wine.name}</p>
          <p className="truncate text-muted">{details}</p>
        </div>
        {wine.rating !== undefined && (
          <span
            className="shrink-0 pl-1 font-semibold text-wine"
            aria-label={fi.rating.star(wine.rating)}
          >
            ★&nbsp;{wine.rating}
          </span>
        )}
      </Link>
    </li>
  );
}
