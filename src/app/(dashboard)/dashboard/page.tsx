"use client";

import { Box } from "@mui/material";
import { Stats } from "@/features/dashboard/components/stats";

export default function DashboardPage() {
  return (
    <Box className="flex flex-col items-center p-4">
      <Stats />
    </Box>
  );
}
