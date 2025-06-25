"use client";

import { AssetsGrid } from "@/features/dashboard/components/assets-grid";
import { useDepot } from "@/features/dashboard/hooks/use-depot";

export default function AssetsPage() {
  const { assets } = useDepot();
  return <AssetsGrid assets={assets} />;
}
