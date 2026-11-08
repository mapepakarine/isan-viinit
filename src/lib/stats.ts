import type { Wine } from '../db/types';
import { capitalize } from './format';
import { compareNewest } from './wineList';

const LIST_LIMIT = 5;

export interface GroupStats {
  name: string;
  count: number;
  averageRating?: number;
}

export interface WineStats {
  total: number;
  averageRating?: number;
  averagePrice?: number;
  topWines: Wine[];
  grapes: GroupStats[];
  countries: GroupStats[];
  bestValue: Wine[];
}

function average(values: number[]): number | undefined {
  if (values.length === 0) return undefined;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

/** Groups wines by a text field, ignoring capitals and surrounding spaces. */
function groupStats(wines: Wine[], pick: (wine: Wine) => string | undefined): GroupStats[] {
  const groups = new Map<string, { name: string; count: number; ratings: number[] }>();
  for (const wine of wines) {
    const name = pick(wine)?.trim();
    if (!name) continue;
    const key = name.toLowerCase();
    const group = groups.get(key) ?? { name: capitalize(name), count: 0, ratings: [] };
    group.count += 1;
    if (wine.rating !== undefined) group.ratings.push(wine.rating);
    groups.set(key, group);
  }

  return [...groups.values()]
    .map(({ name, count, ratings }) => ({ name, count, averageRating: average(ratings) }))
    .sort(
      (a, b) =>
        b.count - a.count ||
        (b.averageRating ?? 0) - (a.averageRating ?? 0) ||
        a.name.localeCompare(b.name, 'fi'),
    )
    .slice(0, LIST_LIMIT);
}

/** Wines by rating divided by price. A free wine has no meaningful ratio, so it is left out. */
export function bestValueWines(wines: Wine[]): Wine[] {
  return wines
    .filter((wine) => wine.rating !== undefined && wine.price !== undefined && wine.price > 0)
    .sort((a, b) => b.rating! / b.price! - a.rating! / a.price! || compareNewest(a, b));
}

export function computeStats(wines: Wine[]): WineStats {
  return {
    total: wines.length,
    averageRating: average(wines.map((wine) => wine.rating).filter(isDefined)),
    averagePrice: average(wines.map((wine) => wine.price).filter(isDefined)),
    topWines: wines
      .filter((wine) => wine.rating !== undefined)
      .sort((a, b) => b.rating! - a.rating! || compareNewest(a, b))
      .slice(0, LIST_LIMIT),
    grapes: groupStats(wines, (wine) => wine.grape),
    countries: groupStats(wines, (wine) => wine.country),
    bestValue: bestValueWines(wines).slice(0, LIST_LIMIT),
  };
}
