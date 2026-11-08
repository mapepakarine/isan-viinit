import type { Rating, Wine, WineType } from '../db/types';

export interface WineFormValues {
  name: string;
  producer: string;
  type: WineType;
  grape: string;
  country: string;
  region: string;
  vintage: string;
  price: string;
  store: string;
  rating?: Rating;
  notes: string;
  food: string;
  buyAgain: boolean;
  tastedAt: string;
}

export type WineFormField = 'name' | 'vintage' | 'price';
export type WineFormErrors = Partial<Record<WineFormField, 'required' | 'invalid'>>;
export type WineFields = Omit<Wine, 'id' | 'photo' | 'thumb' | 'createdAt' | 'updatedAt'>;
export interface WinePhotos {
  photo?: Blob;
  thumb?: Blob;
}

const MIN_VINTAGE = 1900;

/** Local calendar date; toISOString() would give yesterday's date late at night in Finland. */
export function toLocalIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function emptyWineForm(now: Date): WineFormValues {
  return {
    name: '',
    producer: '',
    type: 'red',
    grape: '',
    country: '',
    region: '',
    vintage: '',
    price: '',
    store: '',
    notes: '',
    food: '',
    buyAgain: false,
    tastedAt: toLocalIsoDate(now),
  };
}

export function wineToForm(wine: Wine): WineFormValues {
  return {
    name: wine.name,
    producer: wine.producer ?? '',
    type: wine.type,
    grape: wine.grape ?? '',
    country: wine.country ?? '',
    region: wine.region ?? '',
    vintage: wine.vintage?.toString() ?? '',
    price: wine.price === undefined ? '' : wine.price.toFixed(2).replace('.', ','),
    store: wine.store ?? '',
    rating: wine.rating,
    notes: wine.notes ?? '',
    food: wine.food ?? '',
    buyAgain: wine.buyAgain,
    tastedAt: wine.tastedAt,
  };
}

/** Accepts "12,90", "12.90", "12" and "12,90 €". Returns undefined if it isn't a price. */
export function parsePrice(input: string): number | undefined {
  const cleaned = input.replace('€', '').trim();
  if (!/^\d+([.,]\d{1,2})?$/.test(cleaned)) return undefined;
  return Number(cleaned.replace(',', '.'));
}

export function validateWineForm(values: WineFormValues, now: Date): WineFormErrors {
  const errors: WineFormErrors = {};
  if (!values.name.trim()) errors.name = 'required';

  const vintage = values.vintage.trim();
  if (vintage) {
    const year = Number(vintage);
    const valid = /^\d{4}$/.test(vintage) && year >= MIN_VINTAGE && year <= now.getFullYear() + 1;
    if (!valid) errors.vintage = 'invalid';
  }

  if (values.price.trim() && parsePrice(values.price) === undefined) errors.price = 'invalid';
  return errors;
}

function optional(value: string): string | undefined {
  return value.trim() || undefined;
}

/** Call only with values that passed validateWineForm. */
export function formToWineFields(values: WineFormValues, now: Date): WineFields {
  const vintage = values.vintage.trim();
  return {
    name: values.name.trim(),
    producer: optional(values.producer),
    type: values.type,
    grape: optional(values.grape),
    country: optional(values.country),
    region: optional(values.region),
    vintage: vintage ? Number(vintage) : undefined,
    price: parsePrice(values.price),
    store: optional(values.store),
    rating: values.rating,
    notes: optional(values.notes),
    food: optional(values.food),
    buyAgain: values.buyAgain,
    tastedAt: values.tastedAt || toLocalIsoDate(now),
  };
}

/** Builds the stored record, keeping id and createdAt when editing an existing wine. */
export function buildWineRecord(
  fields: WineFields,
  photos: WinePhotos,
  existing: Wine | undefined,
  now: Date,
): Wine {
  const timestamp = now.toISOString();
  const record: Wine = {
    ...fields,
    photo: photos.photo,
    thumb: photos.thumb,
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };
  if (existing?.id !== undefined) record.id = existing.id;
  return record;
}
