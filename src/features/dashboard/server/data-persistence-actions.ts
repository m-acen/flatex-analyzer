"use server";

import { db } from "@/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { rawAccountDataSet, rawDepotDataSet } from "@/db/schema/raw-data";

interface BaseRawData {
  id: string;
  encryptedData: string;
  fileName: string;
  timestamp: Date;
}

export async function saveRawDataSets({
  depot,
  account,
}: {
  depot: BaseRawData[];
  account: BaseRawData[];
}): Promise<void> {
  console.log("Saving raw data sets:", {
    depot: depot,
    account: account,
  });
  const authHeaders = await headers();
  const session = await auth.api.getSession({ headers: authHeaders });
  if (!session?.user?.id) throw new Error("Not authenticated");
  const userId = session.user.id;
  const now = new Date();

  // 1. Delete existing datasets for user
  await db.delete(rawDepotDataSet).where(eq(rawDepotDataSet.userId, userId));
  await db
    .delete(rawAccountDataSet)
    .where(eq(rawAccountDataSet.userId, userId));

  // 2. Insert new depot datasets
  if (depot.length > 0) {
    await db.insert(rawDepotDataSet).values(
      depot.map((entry) => ({
        id: entry.id,
        userId,
        data: entry.encryptedData,
        fileName: entry.fileName,
        timestamp: new Date(entry.timestamp),
        createdAt: now,
        updatedAt: now,
      }))
    );
  }

  // 3. Insert new account datasets
  if (account.length > 0) {
    await db.insert(rawAccountDataSet).values(
      account.map((entry) => ({
        id: entry.id,
        userId,
        data: entry.encryptedData,
        fileName: entry.fileName,
        timestamp: new Date(entry.timestamp),
        createdAt: now,
        updatedAt: now,
      }))
    );
  }
}

export async function loadRawDataSets(): Promise<{
  depot: BaseRawData[];
  account: BaseRawData[];
}> {
  const authHeaders = await headers();
  const session = await auth.api.getSession({ headers: authHeaders });
  if (!session?.user?.id) throw new Error("Not authenticated");
  const userId = session.user.id;

  const [depotRows, accountRows] = await Promise.all([
    db.select().from(rawDepotDataSet).where(eq(rawDepotDataSet.userId, userId)),
    db
      .select()
      .from(rawAccountDataSet)
      .where(eq(rawAccountDataSet.userId, userId)),
  ]);

  console.log("Loaded raw data sets:", {
    depot: depotRows.length,
    account: accountRows.length,
  });

  const result = {
    depot: depotRows.map((r) => ({
      id: r.id,
      encryptedData: r.data,
      fileName: r.fileName,
      timestamp: r.timestamp,
    })),
    account: accountRows.map((r) => ({
      id: r.id,
      encryptedData: r.data,
      fileName: r.fileName,
      timestamp: r.timestamp,
    })),
  };
  console.log("Parsed raw data sets:", result);
  return result;
}

export async function clearRawDataSets(): Promise<void> {
  const authHeaders = await headers();
  const session = await auth.api.getSession({ headers: authHeaders });
  if (!session?.user?.id) throw new Error("Not authenticated");
  const userId = session.user.id;

  await Promise.all([
    db.delete(rawDepotDataSet).where(eq(rawDepotDataSet.userId, userId)),
    db.delete(rawAccountDataSet).where(eq(rawAccountDataSet.userId, userId)),
  ]);
}
