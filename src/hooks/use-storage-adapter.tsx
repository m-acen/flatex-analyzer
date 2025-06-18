import { useEffect, useRef, useMemo } from "react";
import type { StorageAdapter } from "@/lib/storage-adapter";
import { DataPersistenceMode } from "@/lib/user-config";

export function useStorageAdapter<T>(
  mode: DataPersistenceMode,
  adapterMap: Partial<Record<DataPersistenceMode, StorageAdapter<T>>>
): StorageAdapter<T> | null {
  const prevModeRef = useRef<DataPersistenceMode | null>(null);
  const transferringRef = useRef<Promise<void> | null>(null);

  const currentAdapter = useMemo(() => adapterMap[mode] ?? null, [adapterMap, mode]);

  useEffect(() => {
    const prevMode = prevModeRef.current;

    if (prevMode && prevMode !== mode) {
      const prevAdapter = adapterMap[prevMode];
      const nextAdapter = adapterMap[mode];

      if (prevAdapter && nextAdapter) {
        transferringRef.current = (async () => {
          try {
            const data = await prevAdapter.load();
            await prevAdapter.clear();
            await nextAdapter.save(data);
          } catch (e) {
            console.error("Failed to migrate data between adapters:", e);
          }
        })();
      } else if (prevAdapter?.clear) {
        prevAdapter.clear().catch((e) => {
          console.error("Failed to clear previous adapter:", e);
        });
      }
    }

    prevModeRef.current = mode;
  }, [mode, adapterMap]);

  return currentAdapter;
}
