export interface StorageAdapter<T> {
  load: () => Promise<T>;
  save: (data: T) => Promise<void>;
  clear?: () => Promise<void>;
}

export function createLocalStorageAdapter<T>(key: string): StorageAdapter<T> {
  return {
    load: async () => {
      try {
        const raw = localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : ({} as T);
      } catch (e) {
        console.error("Fehler beim Laden aus localStorage:", e);
        return {} as T;
      }
    },
    save: async (data: T) => {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (e) {
        console.error("Fehler beim Speichern in localStorage:", e);
      }
    },
    clear: async () => {
      localStorage.removeItem(key);
    },
  };
}