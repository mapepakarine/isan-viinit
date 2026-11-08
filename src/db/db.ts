import Dexie, { type Table } from 'dexie';
import type { Wine } from './types';

export interface AppSetting {
  key: string;
  value: string;
}

class WineDatabase extends Dexie {
  wines!: Table<Wine, number>;
  settings!: Table<AppSetting, string>;

  constructor() {
    super('isan-viinit');
    // Never edit an existing version: add db.version(n + 1) with an upgrade function.
    this.version(1).stores({
      wines: '++id, name, type, grape, country, rating, buyAgain, tastedAt',
    });
    this.version(2)
      .stores({ settings: 'key' })
      .upgrade(() => {
        // Adds an empty settings table; the wines are carried over untouched.
      });
  }
}

export const db = new WineDatabase();
