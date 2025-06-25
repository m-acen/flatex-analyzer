import { DepotProvider } from "../hooks/use-depot";
import { useRawData } from "../hooks/use-raw-transaction-data-sets";

export function DepotProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    parsedAccountTransactions: accountTransactions,
    parsedDepotTransactions: depotTransactions,
  } = useRawData();
  return (
    <DepotProvider
      depotTransactions={depotTransactions}
      accountTransactions={accountTransactions}
    >
      {children}
    </DepotProvider>
  );
}
