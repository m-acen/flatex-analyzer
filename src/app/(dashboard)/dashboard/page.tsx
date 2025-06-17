"use client";

import { Box } from "@mui/material";
import { PortfolioOverview } from "@/features/dashboard/components/portfolio-overview";
import { useDepot } from "@/features/dashboard/hooks/use-depot";

export default function DashboardPage() {
  const { assets, accountTransactions, progress } = useDepot();
  return (
    <PortfolioOverview
      accountTransactions={accountTransactions}
      assets={assets}
      progress={progress.state}
    />
  );
}
