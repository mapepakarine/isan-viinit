import { describe, expect, it } from 'vitest';
import type { Wine } from '../db/types';
import { backupReminderDue } from './backupReminder';

const now = new Date('2026-11-30T12:00:00.000Z');
const wine = (createdAt: string, sample?: boolean): Wine => ({
  name: 'Viini',
  type: 'red',
  buyAgain: false,
  tastedAt: '2026-01-01',
  createdAt,
  updatedAt: createdAt,
  ...(sample ? { sample } : {}),
});

describe('backupReminderDue', () => {
  it('never reminds with no wines of his own', () => {
    expect(backupReminderDue(null, [], now)).toBe(false);
    expect(backupReminderDue(null, [wine('2020-01-01T00:00:00.000Z', true)], now)).toBe(false);
  });

  it('gives a new user 30 days from the first wine', () => {
    expect(backupReminderDue(null, [wine('2026-11-20T00:00:00.000Z')], now)).toBe(false);
    expect(backupReminderDue(null, [wine('2026-10-31T11:00:00.000Z')], now)).toBe(true);
  });

  it('counts 30 days from the last backup', () => {
    const wines = [wine('2020-01-01T00:00:00.000Z')];
    expect(backupReminderDue('2026-11-01T12:00:00.000Z', wines, now)).toBe(false);
    expect(backupReminderDue('2026-10-31T12:00:00.000Z', wines, now)).toBe(true);
  });
});
