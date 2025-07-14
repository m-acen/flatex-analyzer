"use client";

import { Suspense } from "react";
import { Footer } from "@/components/footer";
import { DepotProgressBar } from "@/features/dashboard/components/depot-progress-bar";
import { DepotProviderWrapper } from "@/features/dashboard/components/depot-provider-wrapper";
import MiniDrawer from "@/features/dashboard/components/drawer-wrapper";
import { RawDataProvider } from "@/features/dashboard/hooks/use-raw-transaction-data-sets";
import { ShowValuesProvider } from "@/features/dashboard/hooks/use-show-values";
import { Box } from "@mui/material";
import { demoNavItems, navItems } from "@/features/dashboard/config/nav-items";
import { useSearchParams } from "next/navigation";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";
  const updatedNavItems = isDemo ? demoNavItems : navItems;
  return (
    <ShowValuesProvider>
      <RawDataProvider>
        <DepotProviderWrapper isDemo={isDemo}>
          <MiniDrawer navItems={updatedNavItems}>
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

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <LayoutContent>{children}</LayoutContent>
    </Suspense>
  );
}
