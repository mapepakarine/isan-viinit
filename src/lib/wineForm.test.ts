import { describe, expect, it } from 'vitest';
import type { Wine } from '../db/types';
import {
  buildWineRecord,
  emptyWineForm,
  formToWineFields,
  parsePrice,
  toLocalIsoDate,
  validateWineForm,
  wineToForm,
} from './wineForm';

const now = new Date(2026, 10, 8, 23, 30);

describe('toLocalIsoDate', () => {
  it('uses the local calendar date and pads month and day', () => {
    expect(toLocalIsoDate(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });
});

describe('parsePrice', () => {
  it.each([
    ['12,90', 12.9],
    ['12.90', 12.9],
    ['12', 12],
    ['12,90 €', 12.9],
    [' 8,5 ', 8.5],
  ])('parses %s', (input, expected) => {
    expect(parsePrice(input)).toBe(expected);
  });

  it.each(['abc', '12,999', '-5', '1,2,3', ''])('rejects %j', (input) => {
    expect(parsePrice(input)).toBeUndefined();
  });
});

describe('validateWineForm', () => {
  it('requires only a name', () => {
    expect(validateWineForm(emptyWineForm(now), now)).toEqual({ name: 'required' });
    expect(validateWineForm({ ...emptyWineForm(now), name: 'Testi' }, now)).toEqual({});
  });

  it('treats a whitespace-only name as missing', () => {
    expect(validateWineForm({ ...emptyWineForm(now), name: '   ' }, now).name).toBe('required');
  });

  it('flags impossible vintages but allows next year', () => {
    const form = { ...emptyWineForm(now), name: 'Testi' };
    expect(validateWineForm({ ...form, vintage: '21' }, now).vintage).toBe('invalid');
    expect(validateWineForm({ ...form, vintage: '1899' }, now).vintage).toBe('invalid');
    expect(validateWineForm({ ...form, vintage: '2028' }, now).vintage).toBe('invalid');
    expect(validateWineForm({ ...form, vintage: '2027' }, now).vintage).toBeUndefined();
  });

  it('flags an unreadable price', () => {
    const form = { ...emptyWineForm(now), name: 'Testi', price: 'kallis' };
    expect(validateWineForm(form, now).price).toBe('invalid');
  });
});

describe('formToWineFields', () => {
  it('turns empty optional fields into undefined and trims text', () => {
    const fields = formToWineFields({ ...emptyWineForm(now), name: '  Testi ', grape: ' ' }, now);
    expect(fields.name).toBe('Testi');
    expect(fields.grape).toBeUndefined();
    expect(fields.vintage).toBeUndefined();
    expect(fields.price).toBeUndefined();
    expect(fields.buyAgain).toBe(false);
  });

  it('falls back to today when the date was cleared', () => {
    const fields = formToWineFields({ ...emptyWineForm(now), name: 'Testi', tastedAt: '' }, now);
    expect(fields.tastedAt).toBe('2026-11-08');
  });

  it('round-trips a full wine through the form', () => {
    const wine: Wine = {
      name: 'Testi',
      producer: 'Tuottaja',
      type: 'white',
      grape: 'Riesling',
      country: 'Saksa',
      region: 'Mosel',
      vintage: 2021,
      price: 12.9,
      store: 'Alko',
      rating: 4,
      notes: 'Hyvää',
      food: 'Kala',
      buyAgain: true,
      tastedAt: '2026-01-05',
      createdAt: 'x',
      updatedAt: 'x',
    };
    const form = wineToForm(wine);
    expect(form.price).toBe('12,90');
    const { createdAt: _c, updatedAt: _u, ...expected } = wine;
    expect(formToWineFields(form, now)).toEqual(expected);
  });
});

describe('buildWineRecord', () => {
  const fields = formToWineFields({ ...emptyWineForm(now), name: 'Testi' }, now);

  it('leaves id unset for a new wine so the database assigns it', () => {
    const record = buildWineRecord(fields, {}, undefined, now);
    expect('id' in record).toBe(false);
    expect(record.createdAt).toBe(now.toISOString());
    expect(record.updatedAt).toBe(now.toISOString());
  });

  it('keeps id and createdAt when editing, and can remove a photo', () => {
    const existing: Wine = {
      ...fields,
      id: 7,
      photo: new Blob(['x']),
      createdAt: '2020-01-01T00:00:00.000Z',
      updatedAt: '2020-01-01T00:00:00.000Z',
    };
    const record = buildWineRecord(fields, {}, existing, now);
    expect(record.id).toBe(7);
    expect(record.createdAt).toBe('2020-01-01T00:00:00.000Z');
    expect(record.updatedAt).toBe(now.toISOString());
    expect(record.photo).toBeUndefined();
  });
});
