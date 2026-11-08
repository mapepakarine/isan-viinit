import { describe, expect, it } from 'vitest';
import type { Wine } from '../db/types';
import { filterWines, hasActiveFilters, NO_FILTERS, sortWines } from './wineList';

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

describe('filterWines', () => {
  const wines = [
    wine({ name: 'Catena', producer: 'Zapata', grape: 'Malbec', rating: 5, buyAgain: true }),
    wine({ name: 'Chablis', type: 'white', grape: 'Chardonnay', rating: 3, notes: 'Hyvä kalalle' }),
    wine({ name: 'Rosé de Loire', type: 'rose', grape: 'Carménère', rating: 4 }),
    wine({ name: 'Nimetön', type: 'sparkling' }),
  ];

  it('returns everything with no filters', () => {
    expect(filterWines(wines, NO_FILTERS)).toHaveLength(4);
  });

  it.each([
    ['catena', 'Catena'],
    ['ZAPATA', 'Catena'],
    ['malbec', 'Catena'],
    ['kalalle', 'Chablis'],
    ['carmenere', 'Rosé de Loire'],
    ['rose', 'Rosé de Loire'],
    ['  catena  ', 'Catena'],
    ['zapata malbec', 'Catena'],
  ])('finds %j ignoring case and accents', (query, expected) => {
    expect(names(filterWines(wines, { ...NO_FILTERS, query }))).toEqual([expected]);
  });

  it('finds nothing when a search word does not match', () => {
    expect(filterWines(wines, { ...NO_FILTERS, query: 'catena merlot' })).toEqual([]);
  });

  it('treats selected types as alternatives', () => {
    const result = filterWines(wines, { ...NO_FILTERS, types: ['white', 'rose'] });
    expect(names(result)).toEqual(['Chablis', 'Rosé de Loire']);
  });

  it('filters by rating of four or more, excluding unrated', () => {
    expect(names(filterWines(wines, { ...NO_FILTERS, topRated: true }))).toEqual([
      'Catena',
      'Rosé de Loire',
    ]);
  });

  it('filters by buy again', () => {
    expect(names(filterWines(wines, { ...NO_FILTERS, buyAgain: true }))).toEqual(['Catena']);
  });

  it('combines filters', () => {
    const result = filterWines(wines, { ...NO_FILTERS, types: ['red', 'white'], topRated: true });
    expect(names(result)).toEqual(['Catena']);
  });
});

describe('hasActiveFilters', () => {
  it('detects each kind of filter and ignores blank searches', () => {
    expect(hasActiveFilters(NO_FILTERS)).toBe(false);
    expect(hasActiveFilters({ ...NO_FILTERS, query: '  ' })).toBe(false);
    expect(hasActiveFilters({ ...NO_FILTERS, query: 'a' })).toBe(true);
    expect(hasActiveFilters({ ...NO_FILTERS, types: ['red'] })).toBe(true);
    expect(hasActiveFilters({ ...NO_FILTERS, topRated: true })).toBe(true);
    expect(hasActiveFilters({ ...NO_FILTERS, buyAgain: true })).toBe(true);
  });
});

describe('sortWines', () => {
  const wines = [
    wine({ id: 1, name: 'A', tastedAt: '2026-01-01', rating: 3, price: 20 }),
    wine({ id: 2, name: 'B', tastedAt: '2026-03-01' }),
    wine({ id: 3, name: 'C', tastedAt: '2026-02-01', rating: 5, price: 10 }),
    wine({ id: 4, name: 'D', tastedAt: '2026-03-01', rating: 5 }),
  ];

  it('sorts newest first, with the latest added first on the same day', () => {
    expect(names(sortWines(wines, 'date'))).toEqual(['D', 'B', 'C', 'A']);
  });

  it('sorts best first with unrated last, breaking ties by date', () => {
    expect(names(sortWines(wines, 'rating'))).toEqual(['D', 'C', 'A', 'B']);
  });

  it('sorts cheapest first with unpriced last', () => {
    expect(names(sortWines(wines, 'price'))).toEqual(['C', 'A', 'D', 'B']);
  });

  it('does not change the original list', () => {
    const before = names(wines);
    sortWines(wines, 'price');
    expect(names(wines)).toEqual(before);
  });
});
