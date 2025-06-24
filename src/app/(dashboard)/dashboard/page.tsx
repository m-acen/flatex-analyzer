"use client";

import { Box, Button } from "@mui/material";
import { PortfolioOverview } from "@/features/dashboard/components/portfolio-overview";
import { useDepot } from "@/features/dashboard/hooks/use-depot";
import Link from "next/link";

export default function DashboardPage() {
  const { assets, accountTransactions, progress } = useDepot();
  if (assets.length === 0) {
    return (
      <Box sx={{ padding: 2 }}>
        <h2>Keine Daten </h2>
        <Button href="/data" LinkComponent={Link}>
          Daten importieren
        </Button>
      </Box>
    );
  }
  return (
    <PortfolioOverview
      accountTransactions={accountTransactions}
      assets={assets}
      progress={progress.state}
    />
  );
}
