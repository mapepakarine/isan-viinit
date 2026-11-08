export type PersistenceStatus = 'granted' | 'denied' | 'unsupported';

/** Asks the browser not to clear the app's data. Safe to call repeatedly. */
export async function requestPersistence(
  storage: Pick<StorageManager, 'persist' | 'persisted'> | undefined = navigator.storage,
): Promise<PersistenceStatus> {
  if (!storage?.persist || !storage.persisted) return 'unsupported';
  try {
    if (await storage.persisted()) return 'granted';
    return (await storage.persist()) ? 'granted' : 'denied';
  } catch {
    return 'denied';
  }
}
