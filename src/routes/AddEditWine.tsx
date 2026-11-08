import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useMemo, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import BottomBar from '../components/BottomBar';
import { primaryButton, secondaryButton } from '../components/buttonStyles';
import { ChevronIcon } from '../components/Icons';
import PhotoPicker from '../components/PhotoPicker';
import StarRating from '../components/StarRating';
import SuggestionChips from '../components/SuggestionChips';
import WineNotFound from '../components/WineNotFound';
import { db } from '../db/db';
import type { Wine, WineType } from '../db/types';
import { useWine } from '../hooks/useWine';
import { fi } from '../i18n/fi';
import { countryNames, EMPTY_KNOWLEDGE, grapeNames, loadKnowledge } from '../lib/knowledge';
import { suggestValues } from '../lib/suggestions';
import {
  buildWineRecord,
  emptyWineForm,
  formToWineFields,
  validateWineForm,
  wineToForm,
  type WineFormErrors,
  type WineFormField,
  type WineFormValues,
  type WinePhotos,
} from '../lib/wineForm';

const WINE_TYPES: WineType[] = ['red', 'white', 'rose', 'sparkling', 'dessert', 'other'];
const MAX_SUGGESTIONS = 5;

const inputClass =
  'mt-1 block min-h-12 w-full min-w-0 appearance-none rounded-xl border border-line bg-white px-3 py-2 text-ink placeholder:text-muted aria-invalid:border-danger';

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-muted">{label}</span>
      {children}
      {error && <span className="mt-1 block font-semibold text-danger">{error}</span>}
    </label>
  );
}

export default function AddEditWine() {
  const { id } = useParams();
  if (id === undefined) return <WineForm key="new" />;
  return <EditWine key={id} id={id} />;
}

function EditWine({ id }: { id: string }) {
  const existing = useWine(id);
  if (existing === undefined) return <p className="text-muted">{fi.loading}</p>;
  if (existing === null) return <WineNotFound />;
  return <WineForm existing={existing} />;
}

function hasDetails(values: WineFormValues): boolean {
  const { grape, country, region, producer, vintage, price, store, food, notes } = values;
  return Boolean(grape || country || region || producer || vintage || price || store || food || notes);
}

function WineForm({ existing }: { existing?: Wine }) {
  const navigate = useNavigate();
  const [values, setValues] = useState<WineFormValues>(() =>
    existing ? wineToForm(existing) : emptyWineForm(new Date()),
  );
  const [photos, setPhotos] = useState<WinePhotos>({
    photo: existing?.photo,
    thumb: existing?.thumb,
  });
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoFailed, setPhotoFailed] = useState(false);
  const [errors, setErrors] = useState<WineFormErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  // A new wine only needs the essentials; the rest stays out of the way until asked for.
  const [showDetails, setShowDetails] = useState(() => hasDetails(values));
  const [knowledge, setKnowledge] = useState(EMPTY_KNOWLEDGE);
  const wines = useLiveQuery(() => db.wines.toArray());

  useEffect(() => {
    void loadKnowledge().then(setKnowledge);
  }, []);

  const suggestions = useMemo(() => {
    const used = (pick: (wine: Wine) => string | undefined) => (wines ?? []).map(pick);
    return {
      grape: suggestValues(used((w) => w.grape), grapeNames(knowledge), MAX_SUGGESTIONS),
      country: suggestValues(used((w) => w.country), countryNames(knowledge), MAX_SUGGESTIONS),
      store: suggestValues(used((w) => w.store), fi.form.storeDefaults, MAX_SUGGESTIONS),
    };
  }, [wines, knowledge]);

  const set = <K extends keyof WineFormValues>(key: K, value: WineFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    // An error message shouldn't linger next to a value the user has just corrected.
    setErrors((current) => {
      const next = { ...current };
      delete next[key as WineFormField];
      return next;
    });
  };

  const handlePhoto = async (file: File) => {
    setPhotoBusy(true);
    setPhotoFailed(false);
    try {
      // Loaded on demand to keep app start fast; the service worker precaches it for offline use.
      const { createWinePhotos } = await import('../lib/image');
      setPhotos(await createWinePhotos(file));
    } catch {
      setPhotoFailed(true);
    } finally {
      setPhotoBusy(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const now = new Date();
    const nextErrors = validateWineForm(values, now);
    setErrors(nextErrors);
    setSaveFailed(false);
    if (nextErrors.vintage || nextErrors.price) setShowDetails(true);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const record = buildWineRecord(formToWineFields(values, now), photos, existing, now);
      if (existing) {
        await db.wines.put(record);
        navigate(`/wines/${existing.id}`, { replace: true });
      } else {
        await db.wines.add(record);
        navigate('/');
      }
    } catch {
      setSaveFailed(true);
      setSaving(false);
    }
  };

  // The phone keyboard's Enter key must not save a half-filled form by accident.
  const preventEnterSubmit = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key === 'Enter' && event.target instanceof HTMLInputElement) event.preventDefault();
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      onKeyDown={preventEnterSubmit}
      className="flex flex-col gap-4"
    >
      <h1 className="font-display text-3xl font-semibold">
        {existing ? fi.titles.editWine : fi.titles.addWine}
      </h1>

      <PhotoPicker
        photo={photos.photo}
        busy={photoBusy}
        failed={photoFailed}
        onSelect={handlePhoto}
        onRemove={() => {
          setPhotos({});
          setPhotoFailed(false);
        }}
      />

      <Field label={fi.form.name} error={errors.name && fi.form.errors.nameRequired}>
        <input
          name="name"
          value={values.name}
          onChange={(e) => set('name', e.target.value)}
          aria-invalid={Boolean(errors.name)}
          autoCapitalize="sentences"
          className={inputClass}
        />
      </Field>

      <div role="group" aria-label={fi.form.type}>
        <span className="text-muted">{fi.form.type}</span>
        <div className="mt-1 grid grid-cols-3 gap-2">
          {WINE_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              aria-pressed={values.type === type}
              onClick={() => set('type', type)}
              className={`min-h-12 rounded-xl border px-1 active:opacity-80 ${
                values.type === type
                  ? 'border-wine bg-wine font-semibold text-white'
                  : 'border-line bg-white'
              }`}
            >
              {fi.wineTypes[type]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="text-muted">{fi.rating.label}</span>
        <StarRating value={values.rating} onChange={(rating) => set('rating', rating)} />
      </div>

      <label className="flex min-h-12 items-center justify-between gap-3">
        {fi.form.buyAgain}
        <input
          name="buyAgain"
          type="checkbox"
          checked={values.buyAgain}
          onChange={(e) => set('buyAgain', e.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className="relative h-8 w-14 shrink-0 rounded-full bg-muted transition-colors peer-checked:bg-wine peer-focus-visible:outline-2 after:absolute after:top-1 after:left-1 after:h-6 after:w-6 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-6"
        />
      </label>

      <button
        type="button"
        aria-expanded={showDetails}
        onClick={() => setShowDetails(!showDetails)}
        className="flex min-h-12 items-center justify-between gap-3 border-t border-line font-semibold text-wine"
      >
        {showDetails ? fi.form.fewerDetails : fi.form.moreDetails}
        <ChevronIcon
          className={`h-6 w-6 shrink-0 transition-transform ${showDetails ? 'rotate-180' : ''}`}
        />
      </button>

      {showDetails && (
        <div className="flex flex-col gap-4">
          <Field label={fi.form.grape}>
            <input
              name="grape"
              list="grape-options"
              value={values.grape}
              onChange={(e) => set('grape', e.target.value)}
              className={inputClass}
            />
            <datalist id="grape-options">
              {grapeNames(knowledge).map((grape) => (
                <option key={grape} value={grape} />
              ))}
            </datalist>
          </Field>
          <SuggestionChips
            options={suggestions.grape}
            value={values.grape}
            onChange={(grape) => set('grape', grape)}
          />

          <Field label={fi.form.country}>
            <input
              name="country"
              list="country-options"
              value={values.country}
              onChange={(e) => set('country', e.target.value)}
              className={inputClass}
            />
            <datalist id="country-options">
              {countryNames(knowledge).map((country) => (
                <option key={country} value={country} />
              ))}
            </datalist>
          </Field>
          <SuggestionChips
            options={suggestions.country}
            value={values.country}
            onChange={(country) => set('country', country)}
          />

          <Field label={fi.form.region}>
            <input
              name="region"
              value={values.region}
              onChange={(e) => set('region', e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label={fi.form.producer}>
            <input
              name="producer"
              value={values.producer}
              onChange={(e) => set('producer', e.target.value)}
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label={fi.form.vintage} error={errors.vintage && fi.form.errors.vintageInvalid}>
              <input
                name="vintage"
                inputMode="numeric"
                placeholder={fi.form.vintagePlaceholder}
                value={values.vintage}
                onChange={(e) => set('vintage', e.target.value)}
                aria-invalid={Boolean(errors.vintage)}
                className={inputClass}
              />
            </Field>
            <Field label={fi.form.price} error={errors.price && fi.form.errors.priceInvalid}>
              <input
                name="price"
                inputMode="decimal"
                placeholder={fi.form.pricePlaceholder}
                value={values.price}
                onChange={(e) => set('price', e.target.value)}
                aria-invalid={Boolean(errors.price)}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label={fi.form.store}>
            <input
              name="store"
              value={values.store}
              onChange={(e) => set('store', e.target.value)}
              className={inputClass}
            />
          </Field>
          <SuggestionChips
            options={suggestions.store}
            value={values.store}
            onChange={(store) => set('store', store)}
          />

          <Field label={fi.form.food}>
            <input
              name="food"
              placeholder={fi.form.foodPlaceholder}
              value={values.food}
              onChange={(e) => set('food', e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label={fi.form.notes}>
            <textarea
              name="notes"
              rows={3}
              value={values.notes}
              onChange={(e) => set('notes', e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label={fi.form.tastedAt}>
            <input
              name="tastedAt"
              type="date"
              value={values.tastedAt}
              onChange={(e) => set('tastedAt', e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
      )}

      {Object.keys(errors).length > 0 && (
        <p role="alert" className="font-semibold text-danger">
          {fi.form.errors.summary}
        </p>
      )}
      {saveFailed && (
        <p role="alert" className="font-semibold text-danger">
          {fi.form.errors.saveFailed}
        </p>
      )}

      <BottomBar>
        <Link
          to={existing ? `/wines/${existing.id}` : '/'}
          replace
          className={`${secondaryButton} flex-1`}
        >
          {fi.form.cancel}
        </Link>
        <button
          type="submit"
          disabled={saving || photoBusy}
          className={`${primaryButton} flex-[1.4]`}
        >
          {saving ? fi.form.saving : fi.form.save}
        </button>
      </BottomBar>
    </form>
  );
}
