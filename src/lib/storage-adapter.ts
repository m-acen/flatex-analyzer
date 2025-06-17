export interface StorageAdapter<T> {
  load: () => T;
  save: (data: T) => void;
  clear?: () => void;
}

export function createLocalStorageAdapter<T>(key: string): StorageAdapter<T> {
  return {
    load: () => {
      try {
        const raw = localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : {} as T;
      } catch (e) {
        console.error("Fehler beim Laden aus localStorage:", e);
        return {} as T;
      }
    },
    save: (data: T) => {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (e) {
        console.error("Fehler beim Speichern in localStorage:", e);
      }
    },
    clear: () => {
      localStorage.removeItem(key);
    },
  };
}
