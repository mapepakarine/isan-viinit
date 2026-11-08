import { describe, expect, it } from 'vitest';
import data from '../../public/knowledge.json';
import { countryNames, grapeNames, type Knowledge } from './knowledge';

const knowledge = data as Knowledge;

describe('knowledge.json', () => {
  it('provides sorted grape names', () => {
    expect(grapeNames(knowledge)).toContain('Malbec');
    expect(grapeNames(knowledge)).toEqual([...grapeNames(knowledge)].sort((a, b) => a.localeCompare(b, 'fi')));
  });

  it('provides each country once', () => {
    const countries = countryNames(knowledge);
    expect(countries).toContain('Argentiina');
    expect(new Set(countries).size).toBe(countries.length);
  });

  it('handles empty knowledge', () => {
    expect(grapeNames({ grapes: {}, regions: {} })).toEqual([]);
    expect(countryNames({ grapes: {}, regions: {} })).toEqual([]);
  });
});
