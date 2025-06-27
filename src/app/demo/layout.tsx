"use client";

import { Footer } from "@/components/footer";
import { DepotProgressBar } from "@/features/dashboard/components/depot-progress-bar";
import MiniDrawer from "@/features/dashboard/components/drawer-wrapper";
import { DepotProvider } from "@/features/dashboard/hooks/use-depot";
import { ShowValuesProvider } from "@/features/dashboard/hooks/use-show-values";
import { generateTransactionsFromFakeDepotData } from "@/features/dashboard/utils/demo-data";
import { ArrowBack, Inventory, PieChart } from "@mui/icons-material";
import { Box } from "@mui/material";

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = [
    {
      text: "Zurück zur Startseite",
      icon: <ArrowBack />,
      href: "/",
    },
    { text: "Demo Dashboard", icon: <PieChart />, href: "/demo/dashboard" },
    { text: "Demo Assets", icon: <Inventory />, href: "/demo/assets" },
  ];
  const { accountTransactions, depotTransactions } =
    generateTransactionsFromFakeDepotData();
  return (
    <ShowValuesProvider>
      <DepotProvider
        depotTransactions={depotTransactions}
        accountTransactions={accountTransactions}
      >
        <MiniDrawer navItems={navItems}>
          <Box
            width={"100%"}
            sx={{ flexGrow: 1 }}
            display={"flex"}
            flexDirection="column"
            alignItems={"center"}
          >
            <DepotProgressBar />
            {children}
          </Box>
          <Footer />
        </MiniDrawer>
      </DepotProvider>
    </ShowValuesProvider>
  );
}
