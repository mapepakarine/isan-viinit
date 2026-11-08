import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import BottomBar from '../components/BottomBar';
import { primaryButton, secondaryButton } from '../components/buttonStyles';
import WineNotFound from '../components/WineNotFound';
import { db } from '../db/db';
import type { Wine } from '../db/types';
import { useObjectUrl } from '../hooks/useObjectUrl';
import { useWine } from '../hooks/useWine';
import { fi } from '../i18n/fi';
import { formatDate, formatPrice } from '../lib/format';
import { wineSummary } from '../lib/summaries';

const MAX_RATING = 5;

export default function WineCard() {
  const { id } = useParams();
  const wine = useWine(id);

  if (wine === undefined) return <p className="text-muted">{fi.loading}</p>;
  if (wine === null) return <WineNotFound />;
  return <Card wine={wine} />;
}

function Card({ wine }: { wine: Wine }) {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';
  const photoUrl = useObjectUrl(wine.photo);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteFailed, setDeleteFailed] = useState(false);

  const handleDelete = async () => {
    setDeleteFailed(false);
    try {
      await db.wines.delete(wine.id!);
      navigate(from, { replace: true });
    } catch {
      setDeleteFailed(true);
    }
  };

  const rows: [string, string | number | undefined][] = [
    [fi.form.type, fi.wineTypes[wine.type]],
    [fi.form.grape, wine.grape],
    [fi.form.country, wine.country],
    [fi.form.region, wine.region],
    [fi.form.producer, wine.producer],
    [fi.form.vintage, wine.vintage],
    [fi.card.price, wine.price === undefined ? undefined : formatPrice(wine.price)],
    [fi.form.store, wine.store],
    [fi.form.food, wine.food],
    [fi.form.tastedAt, formatDate(wine.tastedAt)],
    [fi.form.buyAgain, wine.buyAgain ? fi.card.yes : fi.card.no],
  ];

  return (
    <article className="flex flex-col gap-4">
      {photoUrl && (
        <img
          src={photoUrl}
          alt={fi.photo.alt}
          className="max-h-[26rem] w-full rounded-2xl bg-white object-contain"
        />
      )}

      <div>
        <h1 className="font-display text-3xl font-semibold break-words">{wine.name}</h1>
        {wine.rating !== undefined && (
          <p className="mt-1 text-2xl text-wine" aria-label={fi.rating.star(wine.rating)}>
            {'★'.repeat(wine.rating)}
            <span className="text-star-empty">{'★'.repeat(MAX_RATING - wine.rating)}</span>
          </p>
        )}
        <p className="mt-2 text-muted">{wineSummary(wine)}</p>
      </div>

      <dl className="divide-y divide-line border-y border-line">
        {rows
          .filter(([, value]) => value !== undefined && value !== '')
          .map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 py-3">
              <dt className="text-muted">{label}</dt>
              <dd className="min-w-0 text-right font-medium break-words">{value}</dd>
            </div>
          ))}
      </dl>

      {wine.notes && (
        <section>
          <h2 className="text-muted">{fi.form.notes}</h2>
          <p className="mt-1 break-words whitespace-pre-wrap">{wine.notes}</p>
        </section>
      )}

      {deleteFailed && (
        <p role="alert" className="font-semibold text-danger">
          {fi.form.errors.deleteFailed}
        </p>
      )}

      {confirmingDelete ? (
        <div role="alert" className="rounded-2xl border border-danger p-3">
          <p className="font-semibold">{fi.form.deleteConfirm}</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className={`${secondaryButton} flex-1`}
            >
              {fi.form.deleteNo}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className={`${primaryButton} flex-1 !bg-danger`}
            >
              {fi.form.deleteYes}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="min-h-11 px-1 text-danger underline"
          >
            {fi.form.delete}
          </button>
        </div>
      )}

      <BottomBar>
        <Link to={from} className={`${secondaryButton} flex-1`}>
          <span aria-hidden="true">‹</span>
          {from === '/stats' ? fi.nav.stats : fi.card.back}
        </Link>
        <Link to={`/wines/${wine.id}/edit`} state={location.state} className={`${primaryButton} flex-[1.4]`}>
          {fi.card.edit}
        </Link>
      </BottomBar>
    </article>
  );
}
