import { get, set, del } from 'idb-keyval';

export interface StorageAdapter<T> {
  load: () => Promise<T>;
  save: (data: T) => Promise<void>;
  clear?: () => Promise<void>;
}

export function createRamStorageAdapter<T>(defaultValue: T): StorageAdapter<T> {
  let value = {...defaultValue};
  return {
    load: async () => {
      return value;
    },
    save: async (data: T) => {
      value = data;
    },
    clear: async () => {
      value = defaultValue;
    },
  };
}

export function createIndexedDBAdapter<T>(key: string): StorageAdapter<T> {
  return {
    load: async () => {
      try {
        const data = await get<T>(key);
        return data ?? ({} as T);
      } catch (e) {
        console.error('Fehler beim Laden aus IndexedDB:', e);
        return {} as T;
      }
    },
    save: async (data: T) => {
      try {
        await set(key, data);
      } catch (e) {
        console.error('Fehler beim Speichern in IndexedDB:', e);
      }
    },
    clear: async () => {
      try {
        await del(key);
      } catch (e) {
        console.error('Fehler beim Löschen aus IndexedDB:', e);
      }
    },
  };
}
