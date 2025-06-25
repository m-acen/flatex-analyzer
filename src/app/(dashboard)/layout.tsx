"use client";

import { Footer } from "@/components/footer";
import { DepotProgressBar } from "@/features/dashboard/components/depot-progress-bar";
import { DepotProviderWrapper } from "@/features/dashboard/components/depot-provider-wrapper";
import MiniDrawer from "@/features/dashboard/components/drawer-wrapper";
import { RawDataProvider } from "@/features/dashboard/hooks/use-raw-transaction-data-sets";
import { ShowValuesProvider } from "@/features/dashboard/hooks/use-show-values";
import { Folder, PieChart } from "@mui/icons-material";
import { Box } from "@mui/material";

  const navItems = [
    { text: "Dashboard", icon: <PieChart />, href: "/dashboard" },
    { text: "Daten", icon: <Folder />, href: "/data" },
  ];

export default function Layout({ children }: { children: React.ReactNode }) {
  
  return (
    <ShowValuesProvider>
      <RawDataProvider>
        <DepotProviderWrapper>
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
        </DepotProviderWrapper>
      </RawDataProvider>
    </ShowValuesProvider>
  );
}
