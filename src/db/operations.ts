import type { MergePlan } from '../lib/backup';
import { db } from './db';
import type { Wine } from './types';

const LAST_BACKUP_KEY = 'lastBackupAt';

export async function getLastBackupAt(): Promise<string | null> {
  return (await db.settings.get(LAST_BACKUP_KEY))?.value ?? null;
}

export async function setLastBackupAt(value: string): Promise<void> {
  await db.settings.put({ key: LAST_BACKUP_KEY, value });
}

/** All-or-nothing: if storing fails halfway, the database rolls back to the old wines. */
export async function replaceAllWines(wines: Wine[]): Promise<void> {
  await db.transaction('rw', db.wines, async () => {
    await db.wines.clear();
    await db.wines.bulkAdd(wines);
  });
}

export async function applyMerge(plan: MergePlan): Promise<void> {
  await db.transaction('rw', db.wines, async () => {
    await db.wines.bulkAdd(plan.add);
    await db.wines.bulkPut(plan.update);
  });
}

export async function removeSampleWines(): Promise<void> {
  await db.wines.filter((wine) => wine.sample === true).delete();
}
