import { describe, expect, it } from 'vitest';
import { createBackup, parseBackup, planMerge } from './backup';
import { createSampleWines } from './sampleWines';

const now = new Date(2026, 10, 15, 12);

describe('createSampleWines', () => {
  const samples = createSampleWines(now);

  it('marks every wine as a sample so that they can be removed together', () => {
    expect(samples.length).toBeGreaterThanOrEqual(5);
    expect(samples.every((wine) => wine.sample === true)).toBe(true);
  });

  it('has no dates in the future and at least one wine this month', () => {
    expect(samples.every((wine) => wine.tastedAt <= '2026-11-15')).toBe(true);
    expect(samples.some((wine) => wine.tastedAt.startsWith('2026-11'))).toBe(true);
  });

  it('gives each wine its own creation time, which merging relies on', () => {
    expect(new Set(samples.map((wine) => wine.createdAt)).size).toBe(samples.length);
    const withIds = samples.map((wine, index) => ({ ...wine, id: index + 1 }));
    expect(planMerge([], withIds).add).toHaveLength(samples.length);
  });

  it('survives a backup round trip with the sample mark', async () => {
    const withIds = samples.map((wine, index) => ({ ...wine, id: index + 1 }));
    const parsed = await parseBackup(await createBackup(withIds, now));
    expect(parsed.wines).toEqual(withIds);
  });
});
