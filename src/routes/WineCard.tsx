import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
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
  const photoUrl = useObjectUrl(wine.photo);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteFailed, setDeleteFailed] = useState(false);

  const handleDelete = async () => {
    setDeleteFailed(false);
    try {
      await db.wines.delete(wine.id!);
      navigate('/', { replace: true });
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
      <Link to="/" className="flex min-h-11 items-center font-semibold text-wine underline">
        <span aria-hidden="true">‹&nbsp;</span>
        {fi.form.backHome}
      </Link>

      {photoUrl && (
        <img
          src={photoUrl}
          alt={fi.photo.alt}
          className="max-h-[28rem] w-full rounded-lg bg-white object-contain"
        />
      )}

      <div>
        <h1 className="text-3xl font-bold break-words text-wine">{wine.name}</h1>
        {wine.rating !== undefined && (
          <p className="mt-1 text-2xl text-wine" aria-label={fi.rating.star(wine.rating)}>
            {'★'.repeat(wine.rating)}
            {'☆'.repeat(MAX_RATING - wine.rating)}
          </p>
        )}
        <p className="mt-2 text-lg">{wineSummary(wine)}</p>
      </div>

      <dl className="divide-y divide-line rounded-lg border border-line bg-white px-3">
        {rows
          .filter(([, value]) => value !== undefined && value !== '')
          .map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 py-3">
              <dt className="font-semibold">{label}</dt>
              <dd className="min-w-0 text-right break-words">{value}</dd>
            </div>
          ))}
      </dl>

      {wine.notes && (
        <section>
          <h2 className="font-semibold">{fi.form.notes}</h2>
          <p className="mt-1 break-words whitespace-pre-wrap">{wine.notes}</p>
        </section>
      )}

      <Link
        to={`/wines/${wine.id}/edit`}
        className="flex min-h-14 items-center justify-center rounded-lg bg-wine px-4 text-lg font-bold text-white"
      >
        {fi.card.edit}
      </Link>

      {deleteFailed && (
        <p role="alert" className="font-semibold text-danger">
          {fi.form.errors.deleteFailed}
        </p>
      )}

      {confirmingDelete ? (
        <div role="alert" className="rounded-lg border border-danger p-3">
          <p className="font-semibold">{fi.form.deleteConfirm}</p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={handleDelete}
              className="min-h-12 flex-1 rounded-lg bg-danger px-2 font-bold text-white"
            >
              {fi.form.deleteYes}
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className="min-h-12 flex-1 rounded-lg border border-muted bg-white px-2 font-semibold"
            >
              {fi.form.deleteNo}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmingDelete(true)}
          className="min-h-12 rounded-lg border border-danger bg-white px-4 font-semibold text-danger"
        >
          {fi.form.delete}
        </button>
      )}
    </article>
  );
}
