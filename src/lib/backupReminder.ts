import type { Wine } from '../db/types';

const REMINDER_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Kept apart from backup.ts so that Home doesn't load the zip library. */
export function backupReminderDue(
  lastBackupAt: string | null,
  wines: Wine[],
  now: Date,
): boolean {
  const own = wines.filter((wine) => !wine.sample);
  if (own.length === 0) return false;

  const since =
    lastBackupAt ?? own.map((wine) => wine.createdAt).sort((a, b) => a.localeCompare(b))[0];
  return now.getTime() - new Date(since).getTime() >= REMINDER_DAYS * DAY_MS;
}
