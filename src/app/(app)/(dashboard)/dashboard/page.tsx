"use client";

import { PortfolioOverview } from "@/features/dashboard/components/portfolio-overview";
import { useDepot } from "@/features/dashboard/hooks/use-depot";
import { Suspense } from "react";

export default function DashboardPage() {
  const { assets, accountTransactions, progress } = useDepot();
  return (
    <Suspense fallback={null}>
      <PortfolioOverview
        accountTransactions={accountTransactions}
        assets={assets}
        progress={progress.state}
      />
    </Suspense>
  );
}
