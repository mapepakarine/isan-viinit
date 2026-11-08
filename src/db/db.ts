import Dexie, { type Table } from 'dexie';
import type { Wine } from './types';

class WineDatabase extends Dexie {
  wines!: Table<Wine, number>;

  constructor() {
    super('isan-viinit');
    // Never edit an existing version: add db.version(n + 1) with an upgrade function.
    this.version(1).stores({
      wines: '++id, name, type, grape, country, rating, buyAgain, tastedAt',
    });
  }
}

export const db = new WineDatabase();
