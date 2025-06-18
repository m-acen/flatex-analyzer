import { Column, eq, Table } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

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

export interface EncryptionAdapter<T> {
  encrypt: (data: T) => T;
  decrypt: (data: T) => T;
}

export function createEncryptedServerStorageAdapter<T>(
  db: NodePgDatabase,
  table: Table,
  keyColumn: Column, // wichtig: Column, nicht keyof InferModel
  keyValue: any,
  encryptionAdapter?: EncryptionAdapter<T>
): StorageAdapter<T> {
  return {
    load: async () => {
      try {
        const result = await db
          .select()
          .from(table)
          .where(eq(keyColumn, keyValue))
          .limit(1);

        if (result.length === 0) {
          return {} as T; // Kein Eintrag gefunden, leeres Objekt zurückgeben
        }

        if (encryptionAdapter) {
          return encryptionAdapter.decrypt(result[0] as T);
        }

        return result[0] as T; // Eintrag gefunden, zurückgeben
      } catch (e) {
        console.error("Fehler beim Laden vom Server:", e);
        return {} as T;
      }
    },

    save: async (data: T) => {
      try {
        if (encryptionAdapter) {
          data = encryptionAdapter.encrypt(data);
        }
        const existing = await db
          .select()
          .from(table)
          .where(eq(keyColumn, keyValue))
          .limit(1);

        if (existing.length > 0) {
          await db
            .update(table)
            .set(data as any)
            .where(eq(keyColumn, keyValue));
        } else {
          await db.insert(table).values(data as any);
        }
      } catch (e) {
        console.error("Fehler beim Speichern am Server:", e);
      }
    },

    clear: async () => {
      try {
        await db.delete(table).where(eq(keyColumn, keyValue));
      } catch (e) {
        console.error("Fehler beim Löschen vom Server:", e);
      }
    },
  };
}
