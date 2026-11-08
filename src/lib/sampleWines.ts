import type { Wine } from '../db/types';
import { fi } from '../i18n/fi';
import { toLocalIsoDate } from './wineForm';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Demo wines dated relative to today, so that the summary and stats have something to show. */
export function createSampleWines(now: Date): Wine[] {
  return fi.samples.map(({ daysAgo, ...fields }, index) => {
    // Each wine needs its own creation time, because merging a backup identifies wines by it.
    const createdAt = new Date(now.getTime() + index).toISOString();
    return {
      ...fields,
      sample: true,
      tastedAt: toLocalIsoDate(new Date(now.getTime() - daysAgo * DAY_MS)),
      createdAt,
      updatedAt: createdAt,
    };
  });
}
