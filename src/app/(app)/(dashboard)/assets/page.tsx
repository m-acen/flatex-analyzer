"use client";

import { AssetsGrid } from "@/features/dashboard/components/assets-grid";
import { useDepot } from "@/features/dashboard/hooks/use-depot";

export default function AssetsPage() {
  const { assets } = useDepot();
  const sortedItems = [...assets].sort((a, b) => {
    const valueA = a.currentPositionValue || 0;
    const valueB = b.currentPositionValue || 0;
    return valueB - valueA;
  });
  return <AssetsGrid assets={sortedItems} />;
}
