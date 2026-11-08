import { describe, expect, it } from 'vitest';
import { suggestValues } from './suggestions';

describe('suggestValues', () => {
  it('lists the most used values first', () => {
    expect(suggestValues(['Lidl', 'Alko', 'Alko'], [], 5)).toEqual(['Alko', 'Lidl']);
  });

  it('treats different capitalisation and spacing as the same value', () => {
    expect(suggestValues(['Alko', 'alko ', undefined, ''], [], 5)).toEqual(['Alko']);
  });

  it('fills up with defaults without repeating', () => {
    expect(suggestValues(['Malbec'], ['Malbec', 'Merlot', 'Syrah'], 2)).toEqual([
      'Malbec',
      'Merlot',
    ]);
  });

  it('respects the limit and handles nothing to suggest', () => {
    expect(suggestValues(['a', 'b', 'c'], [], 2)).toHaveLength(2);
    expect(suggestValues([], [], 5)).toEqual([]);
  });
});
