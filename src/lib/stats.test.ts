import { describe, expect, it } from 'vitest';
import type { Wine } from '../db/types';
import { bestValueWines, computeStats } from './stats';

function wine(overrides: Partial<Wine>): Wine {
  return {
    name: 'Viini',
    type: 'red',
    buyAgain: false,
    tastedAt: '2026-11-01',
    createdAt: 'x',
    updatedAt: 'x',
    ...overrides,
  };
}

const names = (wines: Wine[]) => wines.map((w) => w.name);

describe('computeStats totals', () => {
  it('handles an empty journal', () => {
    const stats = computeStats([]);
    expect(stats.total).toBe(0);
    expect(stats.averageRating).toBeUndefined();
    expect(stats.averagePrice).toBeUndefined();
    expect(stats.topWines).toEqual([]);
    expect(stats.grapes).toEqual([]);
    expect(stats.countries).toEqual([]);
    expect(stats.bestValue).toEqual([]);
  });

  it('averages only the wines that have a rating or a price', () => {
    const stats = computeStats([
      wine({ rating: 5, price: 10 }),
      wine({ rating: 2 }),
      wine({ price: 20 }),
      wine({}),
    ]);
    expect(stats.total).toBe(4);
    expect(stats.averageRating).toBe(3.5);
    expect(stats.averagePrice).toBe(15);
  });

  it('counts a price of zero in the average', () => {
    expect(computeStats([wine({ price: 0 }), wine({ price: 10 })]).averagePrice).toBe(5);
  });
});

describe('top wines', () => {
  it('lists five at most, best first, newest first on a tie, without unrated wines', () => {
    const wines = [
      wine({ name: 'A', rating: 3 }),
      wine({ name: 'B', rating: 5, tastedAt: '2026-01-01' }),
      wine({ name: 'C', rating: 5, tastedAt: '2026-02-01' }),
      wine({ name: 'D', rating: 4 }),
      wine({ name: 'E', rating: 2 }),
      wine({ name: 'F', rating: 1 }),
      wine({ name: 'G' }),
    ];
    expect(names(computeStats(wines).topWines)).toEqual(['C', 'B', 'D', 'A', 'E']);
  });
});

describe('grapes and countries', () => {
  it('groups regardless of capitals and spaces, with count and average of rated wines', () => {
    const { grapes } = computeStats([
      wine({ grape: 'Malbec', rating: 5 }),
      wine({ grape: ' malbec', rating: 4 }),
      wine({ grape: 'MALBEC' }),
      wine({ grape: 'Merlot', rating: 3 }),
      wine({}),
    ]);
    expect(grapes).toEqual([
      { name: 'Malbec', count: 3, averageRating: 4.5 },
      { name: 'Merlot', count: 1, averageRating: 3 },
    ]);
  });

  it('leaves the average out when no wine in the group is rated', () => {
    const { countries } = computeStats([wine({ country: 'Chile' })]);
    expect(countries).toEqual([{ name: 'Chile', count: 1, averageRating: undefined }]);
  });

  it('sorts by count, then by average, then by name, and keeps five', () => {
    const { countries } = computeStats([
      wine({ country: 'Ranska', rating: 3 }),
      wine({ country: 'Italia', rating: 5 }),
      wine({ country: 'Chile', rating: 5 }),
      wine({ country: 'Espanja', rating: 1 }),
      wine({ country: 'Espanja', rating: 1 }),
      wine({ country: 'Saksa' }),
      wine({ country: 'Unkari', rating: 2 }),
    ]);
    expect(countries.map((c) => c.name)).toEqual([
      'Espanja',
      'Chile',
      'Italia',
      'Ranska',
      'Unkari',
    ]);
  });

  it('capitalises a name typed in lower case', () => {
    expect(computeStats([wine({ grape: 'malbec' })]).grapes[0].name).toBe('Malbec');
  });
});

describe('bestValueWines', () => {
  it('ranks by rating divided by price, without free, unpriced or unrated wines', () => {
    const wines = [
      wine({ name: 'Kallis', rating: 5, price: 50 }),
      wine({ name: 'Edullinen', rating: 4, price: 10 }),
      wine({ name: 'Halpa', rating: 1, price: 5 }),
      wine({ name: 'Ei hintaa', rating: 5 }),
      wine({ name: 'Ei arvosanaa', price: 1 }),
      wine({ name: 'Ilmainen', rating: 5, price: 0 }),
    ];
    expect(names(bestValueWines(wines))).toEqual(['Edullinen', 'Halpa', 'Kallis']);
  });

  it('does not change the original list', () => {
    const wines = [wine({ name: 'A', rating: 1, price: 10 }), wine({ name: 'B', rating: 5, price: 5 })];
    bestValueWines(wines);
    expect(names(wines)).toEqual(['A', 'B']);
  });
});
