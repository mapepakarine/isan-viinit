import { describe, expect, it } from 'vitest';
import type { Wine } from '../db/types';
import { journalSummary, wineSummary } from './summaries';

function wine(overrides: Partial<Wine> = {}): Wine {
  return {
    name: 'Testiviini',
    type: 'red',
    buyAgain: false,
    tastedAt: '2026-11-01',
    createdAt: '2026-11-01T12:00:00.000Z',
    updatedAt: '2026-11-01T12:00:00.000Z',
    ...overrides,
  };
}

const now = new Date(2026, 10, 15);

describe('wineSummary', () => {
  it('reads naturally for a full entry', () => {
    const full = wine({
      country: 'Chile',
      grape: 'Carménère',
      vintage: 2021,
      rating: 4,
      price: 12.9,
      store: 'Alko',
      food: 'pihvi',
    });
    expect(wineSummary(full)).toBe(
      'Chileläinen Carménère 2021 · ★4 · 12,90 € (Alko). Söit sen kanssa: pihvi.',
    );
  });

  it('falls back to the wine type for a name-only entry', () => {
    expect(wineSummary(wine())).toBe('Punaviini.');
    expect(wineSummary(wine({ type: 'white' }))).toBe('Valkoviini.');
    expect(wineSummary(wine({ type: 'rose' }))).toBe('Roséviini.');
    expect(wineSummary(wine({ type: 'sparkling' }))).toBe('Kuohuviini.');
    expect(wineSummary(wine({ type: 'dessert' }))).toBe('Jälkiruokaviini.');
    expect(wineSummary(wine({ type: 'other' }))).toBe('Viini.');
  });

  it('uses the type with a country when the grape is missing', () => {
    expect(wineSummary(wine({ country: 'Ranska', type: 'white' }))).toBe('Ranskalainen valkoviini.');
  });

  it('capitalises a grape that starts the sentence', () => {
    expect(wineSummary(wine({ grape: 'malbec', vintage: 2020 }))).toBe('Malbec 2020.');
  });

  it('recognises countries regardless of case', () => {
    expect(wineSummary(wine({ country: 'argentiina', grape: 'Malbec' }))).toBe(
      'Argentiinalainen Malbec.',
    );
  });

  it('shows an unknown country on its own instead of guessing a word form', () => {
    expect(wineSummary(wine({ country: 'Kanada', grape: 'Riesling' }))).toBe('Riesling · Kanada.');
  });

  it('leaves out the parts that are missing', () => {
    expect(wineSummary(wine({ rating: 5 }))).toBe('Punaviini · ★5.');
    expect(wineSummary(wine({ price: 9.5 }))).toBe('Punaviini · 9,50 €.');
    expect(wineSummary(wine({ store: 'Alko' }))).toBe('Punaviini · Alko.');
    expect(wineSummary(wine({ food: 'kala' }))).toBe('Punaviini. Söit sen kanssa: kala.');
  });

  it('never prints undefined or empty separators', () => {
    const summary = wineSummary(wine({ grape: '', country: '', store: '', food: '' }));
    expect(summary).toBe('Punaviini.');
    expect(summary).not.toMatch(/undefined|null|NaN|· ·|\(\)/);
  });
});

describe('journalSummary', () => {
  it('returns nothing for an empty journal', () => {
    expect(journalSummary([], now)).toEqual([]);
  });

  it('says so when nothing was tasted this month', () => {
    expect(journalSummary([wine({ tastedAt: '2026-10-31' })], now)).toEqual([
      'Tässä kuussa et ole vielä maistanut yhtään viiniä.',
    ]);
  });

  it('counts only the current month of the current year', () => {
    const wines = [
      wine({ tastedAt: '2026-11-01' }),
      wine({ tastedAt: '2026-11-30' }),
      wine({ tastedAt: '2026-10-31' }),
      wine({ tastedAt: '2025-11-15' }),
    ];
    expect(journalSummary(wines, now)[0]).toBe('Tässä kuussa olet maistanut 2 viiniä.');
  });

  it('uses the right word form for one wine', () => {
    expect(journalSummary([wine()], now)[0]).toBe('Tässä kuussa olet maistanut yhden viinin.');
  });

  it('names the top grape by average rating, only with at least two rated wines', () => {
    const wines = [
      wine({ grape: 'Malbec', rating: 5 }),
      wine({ grape: 'malbec ', rating: 4 }),
      wine({ grape: 'Merlot', rating: 3 }),
      wine({ grape: 'Merlot', rating: 3 }),
      wine({ grape: 'Riesling', rating: 5 }),
      wine({ grape: 'Syrah' }),
      wine({ grape: 'Syrah' }),
    ];
    expect(journalSummary(wines, now)).toContain(
      'Paras rypäleesi on Malbec: keskiarvo ★4,5 (2 viiniä).',
    );
  });

  it('skips the top grape when no grape has two rated wines', () => {
    const lines = journalSummary([wine({ grape: 'Malbec', rating: 5 }), wine({ grape: 'Malbec' })], now);
    expect(lines.join(' ')).not.toContain('rypäle');
  });

  it('finds the best value by rating divided by price', () => {
    const wines = [
      wine({ name: 'Kallis', rating: 5, price: 50 }),
      wine({ name: 'Edullinen', rating: 4, price: 10 }),
      wine({ name: 'Halpa huono', rating: 1, price: 5 }),
      wine({ name: 'Ei hintaa', rating: 5 }),
      wine({ name: 'Ilmainen', rating: 5, price: 0 }),
    ];
    expect(journalSummary(wines, now)).toContain('Paras vastine rahalle: Edullinen (★4, 10,00 €).');
  });

  it('names the latest buy-again pick by tasting date', () => {
    const wines = [
      wine({ name: 'Vanha', buyAgain: true, tastedAt: '2026-01-01' }),
      wine({ name: 'Uusin', buyAgain: true, tastedAt: '2026-11-02' }),
      wine({ name: 'Ei uudelleen', tastedAt: '2026-11-10' }),
    ];
    expect(journalSummary(wines, now)).toContain('Viimeisin uudelleen ostettava: Uusin.');
  });

  it('prefers the most recently added pick on the same day', () => {
    const wines = [
      wine({ id: 1, name: 'Ensin', buyAgain: true }),
      wine({ id: 2, name: 'Sitten', buyAgain: true }),
    ];
    expect(journalSummary(wines, now)).toContain('Viimeisin uudelleen ostettava: Sitten.');
  });

  it('gives only the count for sparse wines', () => {
    expect(journalSummary([wine(), wine()], now)).toEqual(['Tässä kuussa olet maistanut 2 viiniä.']);
  });
});
