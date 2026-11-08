import { describe, expect, it, vi } from 'vitest';
import { requestPersistence } from './storage';

describe('requestPersistence', () => {
  it('does not ask again when storage is already persistent', async () => {
    const persist = vi.fn();
    const status = await requestPersistence({ persist, persisted: async () => true });
    expect(status).toBe('granted');
    expect(persist).not.toHaveBeenCalled();
  });

  it('reports the browser answer', async () => {
    const persisted = async () => false;
    expect(await requestPersistence({ persist: async () => true, persisted })).toBe('granted');
    expect(await requestPersistence({ persist: async () => false, persisted })).toBe('denied');
  });

  it('copes with browsers lacking the API or throwing', async () => {
    const missing = {} as Pick<StorageManager, 'persist' | 'persisted'>;
    expect(await requestPersistence(missing)).toBe('unsupported');
    const persisted = async () => {
      throw new Error('nope');
    };
    expect(await requestPersistence({ persist: async () => true, persisted })).toBe('denied');
  });
});
