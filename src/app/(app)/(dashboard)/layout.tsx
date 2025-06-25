"use client";

import { Box, Button } from "@mui/material";
import { useDepot } from "@/features/dashboard/hooks/use-depot";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { assets } = useDepot();
  if (assets.length === 0) {
    return (
      <Box
        display={"flex"}
        flexDirection={"column"}
        gap={2}
        sx={{ padding: 2, textAlign: "center" }}
      >
        <h2>Keine Daten </h2>
        <Button variant="outlined" href="/data" LinkComponent={Link}>
          Daten importieren
        </Button>
        <span>oder</span>
        <Button href="/demo" LinkComponent={Link}>
          Demo ausprobieren
        </Button>
      </Box>
    );
  }
  return <>{children}</>;
}
