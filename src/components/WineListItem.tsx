import { Link } from 'react-router-dom';
import type { Wine } from '../db/types';
import { useObjectUrl } from '../hooks/useObjectUrl';
import { fi } from '../i18n/fi';

export default function WineListItem({ wine }: { wine: Wine }) {
  const thumbUrl = useObjectUrl(wine.thumb);

  return (
    <li>
      <Link
        to={`/wines/${wine.id}`}
        className="flex min-h-20 items-center gap-3 rounded-lg border border-line bg-white p-2"
      >
        {thumbUrl ? (
          <img src={thumbUrl} alt="" className="h-16 w-16 shrink-0 rounded-md object-cover" />
        ) : (
          <div aria-hidden="true" className="h-16 w-16 shrink-0 rounded-md bg-wine" />
        )}
        <div className="min-w-0">
          <p className="truncate font-bold">{wine.name}</p>
          <p className="text-muted">
            {fi.wineTypes[wine.type]}
            {wine.rating !== undefined && (
              <span className="ml-2 text-wine" aria-label={fi.rating.star(wine.rating)}>
                {'★'.repeat(wine.rating)}
              </span>
            )}
          </p>
        </div>
      </Link>
    </li>
  );
}
