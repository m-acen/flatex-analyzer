"use client";

import { createContext, useContext } from "react";
import { extractISINs } from "../utils/extract-isins";
import { ProgressDetails, useAssetsCalc } from "./use-assets-calc";
import { ParsedAccountTransaction } from "../types/account-transaction";
import { Asset } from "../types/asset";
import { DepotItem } from "../types/depot-item";
import { ParsedDepotTransaction } from "../types/depot-transaction";
import { useRawData } from "./use-raw-transaction-data-sets";
import { generateTransactionsFromFakeDepotData } from "../utils/demo-data";

function createEmptyDepotItem(tx: ParsedDepotTransaction): DepotItem {
  return {
    isin: tx.ISIN,
    name: tx.Bezeichnung,
    relatedIsins: [],
    depotTransactions: [],
    accountTransactions: [],
  };
}

function matchAccountTransactionsToDepotItem(
  item: DepotItem,
  accountTransactions: ParsedAccountTransaction[]
) {
  accountTransactions.forEach((accTx) => {
    if (accTx.Buchungsinformationen.includes(item.isin))
      item.accountTransactions.push(accTx);
  });
  return item;
}

function getDepotItems(
  depotTransactions: ParsedDepotTransaction[],
  accountTransactions: ParsedAccountTransaction[]
): DepotItem[] {
  const depotTransactionMap = new Map<string, DepotItem>();

  depotTransactions.forEach((tx) => {
    if (!depotTransactionMap.has(tx.ISIN)) {
      const newItem = createEmptyDepotItem(tx);
      const transactionMatchedItem = matchAccountTransactionsToDepotItem(
        newItem,
        accountTransactions
      );
      depotTransactionMap.set(tx.ISIN, transactionMatchedItem);
    }

    const item = depotTransactionMap.get(tx.ISIN);
    if (!item) return;

    item.depotTransactions.push(tx);
    const relatedIsins = extractISINs(tx.Buchungsinformationen);
    relatedIsins.forEach((relatedIsin) => {
      if (
        relatedIsin &&
        !item.relatedIsins.includes(relatedIsin) &&
        relatedIsin !== item.isin
      ) {
        item.relatedIsins.push(relatedIsin);
      }
    });
  });

  return Array.from(depotTransactionMap.values());
}

type DepotContextType = {
  depotItems: DepotItem[];
  depotTransactions: ParsedDepotTransaction[];
  accountTransactions: ParsedAccountTransaction[];
  assets: Asset[];
  progress: ProgressDetails;
};

const DepotContext = createContext<DepotContextType | null>(null);

export function DepotProvider({ children }: { children: React.ReactNode }) {
  const { parsedAccountTransactions: accountTransactions, parsedDepotTransactions: depotTransactions } = useRawData();
  /*const {
    accountTransactions: fakeAccountTransactions,
    depotTransactions: fakeDepotTransactions,
  } = generateTransactionsFromFakeDepotData();
  const depotTransactions =
    parsedDepotTransactions.length > 0
      ? parsedDepotTransactions
      : fakeDepotTransactions;
  const accountTransactions =
    parsedAccountTransactions.length > 0
      ? parsedAccountTransactions
      : fakeAccountTransactions;*/
  const depotItems = getDepotItems(depotTransactions, accountTransactions);
  const { assets, progress } = useAssetsCalc(depotItems);

  return (
    <DepotContext.Provider
      value={{
        depotItems,
        depotTransactions,
        accountTransactions,
        assets,
        progress,
      }}
    >
      {children}
    </DepotContext.Provider>
  );
}

export function useDepot() {
  const context = useContext(DepotContext);
  if (!context) {
    throw new Error("useDepot must be used within a DepotProvider");
  }
  return context;
}
