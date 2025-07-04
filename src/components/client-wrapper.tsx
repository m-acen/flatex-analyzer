"use client";

import React, { useEffect } from "react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { CssBaseline, ThemeProvider } from "@mui/material";
import theme from "@/theme";
import { AuthDialogProvider } from "@/features/auth/hooks/use-auth-dialog";
import { UserConfigProvider } from "@/hooks/use-user-config";

/**
 * One QueryClient instance per browser tab.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // data is treated as fresh for 10 h
      staleTime: 1000 * 60 * 60 * 10,
      // cache garbage‑collected after 24 h of inactivity
      gcTime: 1000 * 60 * 60 * 24,
    },
  },
});

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  /**
   * Attach localStorage persistence once we’re on the client.
   * The typeof‑check prevents window access during SSR.
   */
  useEffect(() => {
    if (typeof window === "undefined") return; // still on the server

    const persister = createAsyncStoragePersister({
      storage: window.localStorage,
      throttleTime: 1000,
    });

    persistQueryClient({
      queryClient,
      persister,
      maxAge: Infinity, // never expire
      buster: "v1", // bump on breaking API changes
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppRouterCacheProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <UserConfigProvider>
            <AuthDialogProvider>{children}</AuthDialogProvider>
          </UserConfigProvider>
        </ThemeProvider>
      </AppRouterCacheProvider>
    </QueryClientProvider>
  );
}
