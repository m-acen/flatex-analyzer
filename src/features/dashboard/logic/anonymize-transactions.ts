import { AccountTransaction } from "@/features/dashboard/types/account-transaction";
import { DepotTransaction } from "@/features/dashboard/types/depot-transaction";

export function anonymizeAccountTransaction(
  tx: AccountTransaction
): AccountTransaction {
  return {
    ...tx,
    "BIC / BLZ": tx["BIC / BLZ"] ? "anon" : "",
    "IBAN / Kontonummer": tx["IBAN / Kontonummer"] ? "anon" : "",
    Auftraggeberkonto: tx.Auftraggeberkonto ? "anon" : "",
    Konto: tx.Konto ? "anon" : "",
  };
}

export function anonymizeDepotTransaction(
  tx: DepotTransaction
): DepotTransaction {
  return {
    ...tx,
    Depot: tx.Depot ? "anon" : "",
  };
}

export function anonymizeAccountTransactions(
  transactions: AccountTransaction[]
): AccountTransaction[] {
  return transactions.map(anonymizeAccountTransaction);
}

export function anonymizeDepotTransactions(
  transactions: DepotTransaction[]
): DepotTransaction[] {
  return transactions.map(anonymizeDepotTransaction);
}
