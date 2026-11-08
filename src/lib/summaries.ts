import type { Wine } from '../db/types';
import { fi } from '../i18n/fi';
import { capitalize, formatDecimal, formatPrice } from './format';
import { compareNewest } from './wineList';
import { toLocalIsoDate } from './wineForm';

const MIN_WINES_FOR_TOP_GRAPE = 2;

function describeWine(wine: Wine): { heading: string; unknownCountry?: string } {
  const what = wine.grape || fi.wineNouns[wine.type];
  const country = wine.country?.trim();
  const adjective = country && fi.countryAdjectives[country.toLowerCase()];
  const words = [adjective, what, wine.vintage].filter(Boolean).join(' ');
  return {
    heading: capitalize(words),
    unknownCountry: country && !adjective ? country : undefined,
  };
}

function purchaseText(wine: Wine): string | undefined {
  if (wine.price === undefined) return wine.store || undefined;
  const price = formatPrice(wine.price);
  return wine.store ? `${price} (${wine.store})` : price;
}

/** One sentence about a wine, e.g. "Chileläinen Carménère 2021 · ★4 · 12,90 € (Alko)." */
export function wineSummary(wine: Wine): string {
  const { heading, unknownCountry } = describeWine(wine);
  const parts = [
    heading,
    unknownCountry,
    wine.rating !== undefined ? `★${wine.rating}` : undefined,
    purchaseText(wine),
  ].filter(Boolean);
  const sentence = `${parts.join(' · ')}.`;
  return wine.food ? `${sentence} ${fi.summary.food(wine.food)}` : sentence;
}

function topGrapeLine(wines: Wine[]): string | undefined {
  const groups = new Map<string, { name: string; ratings: number[] }>();
  for (const wine of wines) {
    const name = wine.grape?.trim();
    if (!name || wine.rating === undefined) continue;
    const key = name.toLowerCase();
    const group = groups.get(key) ?? { name: capitalize(name), ratings: [] };
    group.ratings.push(wine.rating);
    groups.set(key, group);
  }

  const ranked = [...groups.values()]
    .filter((group) => group.ratings.length >= MIN_WINES_FOR_TOP_GRAPE)
    .map(({ name, ratings }) => ({
      name,
      count: ratings.length,
      average: ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length,
    }))
    .sort(
      (a, b) =>
        b.average - a.average || b.count - a.count || a.name.localeCompare(b.name, 'fi'),
    );

  const top = ranked[0];
  return top && fi.summary.topGrape(top.name, formatDecimal(top.average), top.count);
}

function bestValueLine(wines: Wine[]): string | undefined {
  const best = wines
    .filter((wine) => wine.rating !== undefined && wine.price !== undefined && wine.price > 0)
    .sort((a, b) => b.rating! / b.price! - a.rating! / a.price! || compareNewest(a, b))[0];
  return best && fi.summary.bestValue(best.name, best.rating!, formatPrice(best.price!));
}

function latestBuyAgainLine(wines: Wine[]): string | undefined {
  const latest = wines.filter((wine) => wine.buyAgain).sort(compareNewest)[0];
  return latest && fi.summary.latestBuyAgain(latest.name);
}

/** The journal summary as separate sentences; empty when there are no wines yet. */
export function journalSummary(wines: Wine[], now: Date): string[] {
  if (wines.length === 0) return [];
  const month = toLocalIsoDate(now).slice(0, 7);
  const thisMonth = wines.filter((wine) => wine.tastedAt.startsWith(month)).length;
  return [
    fi.summary.thisMonth(thisMonth),
    topGrapeLine(wines),
    bestValueLine(wines),
    latestBuyAgainLine(wines),
  ].filter((line): line is string => Boolean(line));
}
