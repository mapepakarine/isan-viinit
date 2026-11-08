import type { Wine, WineType } from '../db/types';

export interface WineFilters {
  query: string;
  types: WineType[];
  topRated: boolean;
  buyAgain: boolean;
}

export type WineSort = 'date' | 'rating' | 'price';

export const NO_FILTERS: WineFilters = { query: '', types: [], topRated: false, buyAgain: false };

const TOP_RATING = 4;

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();
}

function searchWords(query: string): string[] {
  return normalize(query).split(/\s+/).filter(Boolean);
}

export function hasActiveFilters(filters: WineFilters): boolean {
  return (
    searchWords(filters.query).length > 0 ||
    filters.types.length > 0 ||
    filters.topRated ||
    filters.buyAgain
  );
}

export function filterWines(wines: Wine[], filters: WineFilters): Wine[] {
  const words = searchWords(filters.query);
  return wines.filter((wine) => {
    if (filters.types.length > 0 && !filters.types.includes(wine.type)) return false;
    if (filters.topRated && (wine.rating ?? 0) < TOP_RATING) return false;
    if (filters.buyAgain && !wine.buyAgain) return false;
    if (words.length === 0) return true;
    const text = normalize(
      [wine.name, wine.producer, wine.grape, wine.notes].filter(Boolean).join(' '),
    );
    return words.every((word) => text.includes(word));
  });
}

/** Newest tasting first; on the same day, the most recently added first. */
export function compareNewest(a: Wine, b: Wine): number {
  return b.tastedAt.localeCompare(a.tastedAt) || (b.id ?? 0) - (a.id ?? 0);
}

export function sortWines(wines: Wine[], sort: WineSort): Wine[] {
  const compare = {
    date: compareNewest,
    rating: (a: Wine, b: Wine) => (b.rating ?? 0) - (a.rating ?? 0) || compareNewest(a, b),
    // Two unpriced wines give Infinity - Infinity = NaN, which falls through to the date.
    price: (a: Wine, b: Wine) =>
      (a.price ?? Infinity) - (b.price ?? Infinity) || compareNewest(a, b),
  }[sort];
  return [...wines].sort(compare);
}

/** How many filters are chosen in the filter sheet; the search box is shown separately. */
export function activeFilterCount(filters: WineFilters): number {
  return filters.types.length + Number(filters.topRated) + Number(filters.buyAgain);
}
