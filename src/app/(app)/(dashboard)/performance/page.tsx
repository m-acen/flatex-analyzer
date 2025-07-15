"use client";

import PerformanceChart from "@/features/dashboard/components/performance-chart";
import { Suspense } from "react";

export default function PerformancePage() {
  return (
    <Suspense fallback={null}>
      <PerformanceChart />
    </Suspense>
  );
}
