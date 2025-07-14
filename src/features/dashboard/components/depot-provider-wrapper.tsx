import { DepotProvider } from "../hooks/use-depot";
import { useRawData } from "../hooks/use-raw-transaction-data-sets";
import { generateTransactionsFromFakeDepotData } from "../utils/demo-data";

export function DepotProviderWrapper({
  children,
  isDemo = false,
}: {
  children: React.ReactNode;
  isDemo?: boolean;
}) {
  if (isDemo) {
    return <DemoDepotProviderWrapper>{children}</DemoDepotProviderWrapper>;
  } else {
    return <RealDepotProviderWrapper>{children}</RealDepotProviderWrapper>;
  }
}

function DemoDepotProviderWrapper({ children }: { children: React.ReactNode }) {
  const { accountTransactions, depotTransactions } =
    generateTransactionsFromFakeDepotData();
  return (
    <DepotProvider
      depotTransactions={depotTransactions}
      accountTransactions={accountTransactions}
    >
      {children}
    </DepotProvider>
  );
}

function RealDepotProviderWrapper({ children }: { children: React.ReactNode }) {
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
