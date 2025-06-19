import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useEffect,
  useRef,
} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  RawAccountTransactionDataSet,
  RawDepotTransactionDataSet,
} from "../types/raw-transaction-data-set";
import {
  handleParseDepotTransactionData,
  handleParseAccountTransactionData,
  mergeDepotTransactions,
  mergeAccountTransactions,
} from "../logic/transaction-parsing";
import { AccountTransaction, ParsedAccountTransaction } from "../types/account-transaction";
import { DepotTransaction, ParsedDepotTransaction } from "../types/depot-transaction";
import {
  createLocalStorageAdapter,
  createRamStorageAdapter,
  StorageAdapter,
} from "@/lib/storage-adapter";
import { useUserConfig } from "@/hooks/use-user-config";
import { DataPersistenceMode } from "@/lib/user-config";
import { clearRawDataSets, loadRawDataSets, saveRawDataSets } from "../server/data-persistence-actions";

// server adapter: data-persistence-actions.ts + encrypt/decrypt. key in params

type RawDataState = {
  depot: RawDepotTransactionDataSet[];
  account: RawAccountTransactionDataSet[];
};

interface RawDataContextType {
  depotDataSets: RawDepotTransactionDataSet[];
  accountDataSets: RawAccountTransactionDataSet[];
  parsedDepotTransactions: ParsedDepotTransaction[];
  parsedAccountTransactions: ParsedAccountTransaction[];
  error: string | null;
  isLoading: boolean;
  isPorting: boolean; // We still expose this for specific UI feedback
  handleRawCsvUpload: (data: unknown[], fileName: string) => void;
  deleteDepotDataSet: (id: string) => void;
  deleteAccountDataSet: (id: string) => void;
}

function encryptData<T>(data: T, salt: string): string {
  // Implement your encryption logic here
  // This is a placeholder, actual implementation will depend on your encryption method
  return JSON.stringify(data); // Replace with actual encryption
}

function decryptData<T>(data: string, salt: string): T {
  // Implement your decryption logic here
  // This is a placeholder, actual implementation will depend on your encryption method
  return JSON.parse(data); // Replace with actual decryption
}

function createServerAdapter(salt: string): StorageAdapter<RawDataState> {
  return {
    load: async () => {
      // Implement server-side loading logic here
      // This is a placeholder, actual implementation will depend on your server setup
      const data = await loadRawDataSets();
      console.log("Loaded raw data from server:", data);
      const decryptedDepot = data.depot.map(d => {
        return ({
          ...d,
          data: decryptData<DepotTransaction[]>(d.encryptedData, salt)
        });
      });
      const decryptedAccount = data.account.map(a => {
        return ({
          ...a, data:
            decryptData<AccountTransaction[]>(a.encryptedData, salt)
        });
      });
      const decryptedData = {
        depot: decryptedDepot,
        account: decryptedAccount,
      }
      return decryptedData;
    },
    save: async (data: RawDataState) => {
      // Implement server-side saving logic here
      // This is a placeholder, actual implementation will depend on your server setup
      const encryptedDepot = data.depot.map(d => ({
        ...d,
        encryptedData: encryptData(d.data, salt),
      }));
      const encryptedAccount = data.account.map(a => ({
        ...a,
        encryptedData: encryptData(a.data, salt),
      }));
      await saveRawDataSets({ depot: encryptedDepot, account: encryptedAccount });
    },
    clear: async () => {
      clearRawDataSets();
    }
  };
}

const RawDataContext = createContext<RawDataContextType | undefined>(undefined);
const defaultRawData: RawDataState = { depot: [], account: [] };
const adapterMap: Partial<Record<DataPersistenceMode, StorageAdapter<RawDataState>>> = {
  local: createLocalStorageAdapter<RawDataState>("raw_transaction_data"),
  none: createRamStorageAdapter<RawDataState>(defaultRawData),
  server: createServerAdapter("penis")
};

export const RawDataProvider = ({ children }: { children: ReactNode }) => {
  const { config, isLoading: isConfigLoading } = useUserConfig();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const queryKey = ["rawTransactionData", config.dataPersistenceMode];

  const { data: rawData, isLoading: isDataLoading } = useQuery({
    queryKey: queryKey,
    queryFn: async () => {
      const adapter = adapterMap[config.dataPersistenceMode];
      if (!adapter) return defaultRawData;
      return (await adapter.load()) ?? defaultRawData;
    },
    enabled: !isConfigLoading,
  });

  // --- Mutation for Porting Data ---
  const portDataMutation = useMutation({
    mutationFn: async ({ oldAdapter, newAdapter }: { oldAdapter: StorageAdapter<RawDataState>; newAdapter: StorageAdapter<RawDataState> }) => {
      const currentData = await oldAdapter.load();
      const dataToPort = currentData !== undefined && Object.keys(currentData).length > 0 ? currentData : defaultRawData;
      await newAdapter.save(dataToPort);
      await oldAdapter.clear();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rawTransactionData"] });
      setError(null);
    },
    onError: (err) => {
      console.error("Failed to port data:", err);
      setError("Failed to migrate data to the new storage mode.");
    },
  });

  // --- Effect to Trigger Porting ---
  const previousMode = useRef<DataPersistenceMode>(config.dataPersistenceMode);

  useEffect(() => {
    const newMode = config.dataPersistenceMode;
    const oldMode = previousMode.current;

    if (newMode !== oldMode) {
      const oldAdapter = adapterMap[oldMode];
      const newAdapter = adapterMap[newMode];

      if (oldAdapter && newAdapter) {
        portDataMutation.mutate({ oldAdapter, newAdapter });
      }
      previousMode.current = newMode;
    }
  }, [config.dataPersistenceMode, portDataMutation]);

  // --- Mutation for User-Initiated Updates ---
  const updateMutation = useMutation({
    mutationFn: async (newData: RawDataState) => {
      const adapter = adapterMap[config.dataPersistenceMode];
      if (!adapter?.save) throw new Error("Saving is not supported.");
      await adapter.save(newData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err) => {
      setError(`Failed to save data: ${(err as Error).message}`);
    }
  });

  // --- Event Handlers ---
  const handleRawCsvUpload = (csvData: unknown[], fileName: string) => {
    /* ... (handler logic remains the same) ... */
    setError(null);
    const id = crypto.randomUUID?.() ?? `${Date.now()}`;
    const timestamp = new Date();
    const currentData = rawData ?? defaultRawData;

    if (handleParseDepotTransactionData(csvData)) {
      const newDepotData = [
        ...currentData.depot,
        { id, data: csvData, fileName, timestamp },
      ];
      updateMutation.mutate({ ...currentData, depot: newDepotData });
    } else if (handleParseAccountTransactionData(csvData)) {
      const newAccountData = [
        ...currentData.account,
        { id, data: csvData, fileName, timestamp },
      ];
      updateMutation.mutate({ ...currentData, account: newAccountData });
    } else {
      setError("Keine gültigen Transaktionsdaten in der CSV gefunden.");
    }
  };
  const deleteDepotDataSet = (id: string) => {
    const currentData = rawData ?? defaultRawData;
    const updated = currentData.depot.filter((ds) => ds.id !== id);
    updateMutation.mutate({ ...currentData, depot: updated });
  };
  const deleteAccountDataSet = (id: string) => {
    const currentData = rawData ?? defaultRawData;
    const updated = currentData.account.filter((ds) => ds.id !== id);
    updateMutation.mutate({ ...currentData, account: updated });
  };

  // --- Memoized Parsed Data ---
  const depotDataSets = rawData?.depot ?? [];
  const accountDataSets = rawData?.account ?? [];

  const parsedDepotTransactions = useMemo(
    () => mergeDepotTransactions(
      depotDataSets.map((ds) => handleParseDepotTransactionData(ds.data) ?? [])
    ), [depotDataSets]
  );

  const parsedAccountTransactions = useMemo(
    () => mergeAccountTransactions(
      accountDataSets.map((ds) => handleParseAccountTransactionData(ds.data) ?? [])
    ), [accountDataSets]
  );


  const value: RawDataContextType = {
    depotDataSets,
    accountDataSets,
    parsedDepotTransactions,
    parsedAccountTransactions,
    error,
    // The overall loading state now includes the porting mutation's status
    isLoading: isConfigLoading || isDataLoading || updateMutation.isPending || portDataMutation.isPending,
    // isPorting is now derived directly from the mutation's state
    isPorting: portDataMutation.isPending,
    handleRawCsvUpload,
    deleteDepotDataSet,
    deleteAccountDataSet,
  };

  return (
    <RawDataContext.Provider value={value}>
      {children}
    </RawDataContext.Provider>
  );
};

export const useRawData = () => {
  const context = useContext(RawDataContext);
  if (!context) {
    throw new Error("useRawData must be used within a RawDataProvider");
  }
  return context;
};