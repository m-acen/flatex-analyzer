import React, { createContext, useContext, useState, ReactNode } from "react";
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
import { ParsedAccountTransaction } from "../types/account-transaction";
import { ParsedDepotTransaction } from "../types/depot-transaction";
import { StorageAdapter } from "@/lib/storage-adapter";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";

interface RawDataContextType {
  depotDataSets: RawDepotTransactionDataSet[];
  accountDataSets: RawAccountTransactionDataSet[];
  parsedDepotTransactions: ParsedDepotTransaction[];
  parsedAccountTransactions: ParsedAccountTransaction[];
  error: string | null;
  handleRawCsvUpload: (data: unknown[], fileName: string) => void;
  deleteDepotDataSet: (id: string) => void;
  deleteAccountDataSet: (id: string) => void;
  storageAdapter?: StorageAdapter<{
    depot: RawDepotTransactionDataSet[];
    account: RawAccountTransactionDataSet[];
  }>;
  setStorageAdapter?: (
    adapter: StorageAdapter<{
      depot: RawDepotTransactionDataSet[];
      account: RawAccountTransactionDataSet[];
    }>
  ) => void;
}

const RawDataContext = createContext<RawDataContextType | undefined>(undefined);

interface RawDataProviderProps {
  children: ReactNode;
}

export const RawDataProvider = ({ children }: RawDataProviderProps) => {
  const queryClient = useQueryClient();
  const [storageAdapter, setStorageAdapter] = useState<
    | StorageAdapter<{
        depot: RawDepotTransactionDataSet[];
        account: RawAccountTransactionDataSet[];
      }>
    | undefined
  >(undefined);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["rawData"],
    queryFn: async () => {
      if (!storageAdapter) return { depot: [], account: [] };
      return await storageAdapter.load();
    },
    staleTime: Infinity, // don't refetch unless manually invalidated
    enabled: !!storageAdapter,
    initialData: { depot: [], account: [] },
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: {
      depot: RawDepotTransactionDataSet[];
      account: RawAccountTransactionDataSet[];
    }) => {
      await storageAdapter?.save(payload);
      return payload;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["rawData"], data);
    },
  });

  const [error, setError] = useState<string | null>(null);

  const persist = (
    depot: RawDepotTransactionDataSet[],
    account: RawAccountTransactionDataSet[]
  ) => {
    saveMutation.mutate({ depot, account });
  };

  const handleRawCsvUpload = (csvData: unknown[], fileName: string) => {
    setError(null);
    const timestamp = new Date();
    const id =
      crypto.randomUUID?.() ??
      `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const depotParsed = handleParseDepotTransactionData(csvData);
    if (depotParsed) {
      const newDepot = [
        ...(data?.depot ?? []),
        { id, data: csvData, fileName, timestamp },
      ];
      persist(newDepot, data?.account ?? []);
      return;
    }

    const accountParsed = handleParseAccountTransactionData(csvData);
    if (accountParsed) {
      const newAccount = [
        ...(data?.account ?? []),
        { id, data: csvData, fileName, timestamp },
      ];
      persist(data?.depot ?? [], newAccount);
      return;
    }

    setError("Keine gültigen Transaktionsdaten in der CSV gefunden.");
  };

  const deleteDepotDataSet = (id: string) => {
    const updated = data!.depot.filter((ds) => ds.id !== id);
    persist(updated, data!.account);
  };

  const deleteAccountDataSet = (id: string) => {
    const updated = data!.account.filter((ds) => ds.id !== id);
    persist(data!.depot, updated);
  };

  const parsedDepotTransactions = mergeDepotTransactions(
    data!.depot.map((ds) => handleParseDepotTransactionData(ds.data) ?? [])
  );

  const parsedAccountTransactions = mergeAccountTransactions(
    data!.account.map((ds) => handleParseAccountTransactionData(ds.data) ?? [])
  );

  return (
    <RawDataContext.Provider
      value={{
        depotDataSets: data!.depot,
        accountDataSets: data!.account,
        parsedDepotTransactions,
        parsedAccountTransactions,
        error,
        handleRawCsvUpload,
        deleteDepotDataSet,
        deleteAccountDataSet,
        storageAdapter,
        setStorageAdapter,
      }}
    >
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
