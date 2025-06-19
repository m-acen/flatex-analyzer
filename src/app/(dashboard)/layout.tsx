"use client";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { DepotProgressBar } from "@/features/dashboard/components/depot-progress-bar";
import MiniDrawer from "@/features/dashboard/components/drawer-wrapper";
import { DepotProvider } from "@/features/dashboard/hooks/use-depot";
import { RawDataProvider } from "@/features/dashboard/hooks/use-raw-transaction-data-sets";
import { ShowValuesProvider } from "@/features/dashboard/hooks/use-show-values";
import { Box } from "@mui/material";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ShowValuesProvider>
      <RawDataProvider>
        <DepotProvider>
          <MiniDrawer>
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
      </RawDataProvider>
    </ShowValuesProvider>
  );
}
