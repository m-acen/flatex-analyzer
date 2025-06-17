import {
  RawAccountTransactionDataSet,
  RawDepotTransactionDataSet,
} from "../types/raw-transaction-data-set";

const LOCAL_STORAGE_KEY = "rawTransactionDataSets";

export function getPersistenceHandlers(mode: "none" | "localStorage" | "server") {
  const load = (): {
    depot: RawDepotTransactionDataSet[];
    account: RawAccountTransactionDataSet[];
  } => {
    if (mode === "localStorage") {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            depot: parsed?.depot ?? [],
            account: parsed?.account ?? [],
          };
        }
      } catch (e) {
        console.error("Fehler beim Laden aus localStorage:", e);
      }
    }
    return { depot: [], account: [] };
  };

  const save = (
    depot: RawDepotTransactionDataSet[],
    account: RawAccountTransactionDataSet[]
  ) => {
    if (mode === "localStorage") {
      try {
        localStorage.setItem(
          LOCAL_STORAGE_KEY,
          JSON.stringify({ depot, account })
        );
      } catch (e) {
        console.error("Fehler beim Speichern in localStorage:", e);
      }
    }
  };

  const clear = () => {
    if (mode === "localStorage") {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  return { load, save, clear };
}
