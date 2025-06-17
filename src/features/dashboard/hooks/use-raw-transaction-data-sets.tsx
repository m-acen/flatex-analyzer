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

interface RawDataContextType {
  depotDataSets: RawDepotTransactionDataSet[];
  accountDataSets: RawAccountTransactionDataSet[];
  parsedDepotTransactions: ParsedDepotTransaction[];
  parsedAccountTransactions: ParsedAccountTransaction[];
  error: string | null;
  handleRawCsvUpload: (data: unknown[], fileName: string) => void;
  deleteDepotDataSet: (id: string) => void;
  deleteAccountDataSet: (id: string) => void;
}

const RawDataContext = createContext<RawDataContextType | undefined>(undefined);

interface RawDataProviderProps {
  children: ReactNode;
  storageAdapter?: StorageAdapter<{
    depot: RawDepotTransactionDataSet[];
    account: RawAccountTransactionDataSet[];
  }>;
}

export const RawDataProvider = ({
  children,
  storageAdapter
}: RawDataProviderProps) => {
  const initialData = storageAdapter?.load() ?? { depot: [], account: [] };

  const [depotDataSets, setDepotDataSets] = useState(initialData.depot || []);
  const [accountDataSets, setAccountDataSets] = useState(initialData.account || []);
  const [error, setError] = useState<string | null>(null);

  const persist = (
    depot: RawDepotTransactionDataSet[],
    account: RawAccountTransactionDataSet[]
  ) => {
    storageAdapter?.save({ depot, account });
  };

  const handleRawCsvUpload = (data: unknown[], fileName: string) => {
    setError(null);
    const timestamp = new Date();
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const depotParsed = handleParseDepotTransactionData(data);
    if (depotParsed) {
      const newDepot = [...depotDataSets, { id, data, fileName, timestamp }];
      setDepotDataSets(newDepot);
      persist(newDepot, accountDataSets);
      return;
    }

    const accountParsed = handleParseAccountTransactionData(data);
    if (accountParsed) {
      const newAccount = [
        ...accountDataSets,
        { id, data, fileName, timestamp },
      ];
      setAccountDataSets(newAccount);
      persist(depotDataSets, newAccount);
      return;
    }

    setError("Keine gültigen Transaktionsdaten in der CSV gefunden.");
  };

  const deleteDepotDataSet = (id: string) => {
    const updated = depotDataSets.filter((ds) => ds.id !== id);
    setDepotDataSets(updated);
    persist(updated, accountDataSets);
  };

  const deleteAccountDataSet = (id: string) => {
    const updated = accountDataSets.filter((ds) => ds.id !== id);
    setAccountDataSets(updated);
    persist(depotDataSets, updated);
  };

  const parsedDepotTransactions = mergeDepotTransactions(
    depotDataSets.map((ds) => handleParseDepotTransactionData(ds.data) ?? [])
  );

  const parsedAccountTransactions = mergeAccountTransactions(
    accountDataSets.map(
      (ds) => handleParseAccountTransactionData(ds.data) ?? []
    )
  );

  return (
    <RawDataContext.Provider
      value={{
        depotDataSets,
        accountDataSets,
        parsedDepotTransactions,
        parsedAccountTransactions,
        error,
        handleRawCsvUpload,
        deleteDepotDataSet,
        deleteAccountDataSet,
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