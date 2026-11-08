import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import type { Wine } from '../db/types';

/** The wine for a route's :id: undefined while loading, null if there is no such wine. */
export function useWine(id: string | undefined): Wine | null | undefined {
  return useLiveQuery(async () => {
    const wineId = Number(id);
    return Number.isInteger(wineId) ? ((await db.wines.get(wineId)) ?? null) : null;
  }, [id]);
}
