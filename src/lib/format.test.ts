import { describe, expect, it } from 'vitest';
import { formatDate, formatDecimal, formatPrice } from './format';

describe('formatPrice', () => {
  it.each([
    [12.9, '12,90 €'],
    [8, '8,00 €'],
    [0.5, '0,50 €'],
    [1234.5, '1234,50 €'],
  ])('formats %d', (input, expected) => {
    expect(formatPrice(input)).toBe(expected);
  });
});

describe('formatDecimal', () => {
  it('uses a comma and one decimal', () => {
    expect(formatDecimal(4.5)).toBe('4,5');
    expect(formatDecimal(4)).toBe('4,0');
    expect(formatDecimal(4.26)).toBe('4,3');
  });
});

describe('formatDate', () => {
  it('uses the Finnish day.month.year order without leading zeros', () => {
    expect(formatDate('2026-11-08')).toBe('8.11.2026');
    expect(formatDate('2026-01-31')).toBe('31.1.2026');
  });
});
