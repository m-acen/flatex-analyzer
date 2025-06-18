"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { CssBaseline, ThemeProvider } from "@mui/material";
import theme from "@/theme";
import { AuthDialogProvider } from "@/features/auth/hooks/use-auth-dialog";
import { UserConfigProvider } from "@/hooks/use-user-config";

const queryClient = new QueryClient();
export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
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
