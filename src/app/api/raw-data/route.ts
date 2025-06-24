import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { rawAccountDataSet, rawDepotDataSet } from "@/db/schema/raw-data";
import { rawDataPayloadSchema } from "@/lib/raw-data-schema";

async function getUserId(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) throw new Error("Not authenticated");
  return session.user.id;
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req);

    const [depotRows, accountRows] = await Promise.all([
      db.select().from(rawDepotDataSet).where(eq(rawDepotDataSet.userId, userId)),
      db.select().from(rawAccountDataSet).where(eq(rawAccountDataSet.userId, userId)),
    ]);

    return NextResponse.json({
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
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    const now = new Date();
    const json = await req.json();

    // ✅ Validate the request body with Zod
    const { depot, account } = rawDataPayloadSchema.parse(json);

    // Clear existing entries
    await db.delete(rawDepotDataSet).where(eq(rawDepotDataSet.userId, userId));
    await db.delete(rawAccountDataSet).where(eq(rawAccountDataSet.userId, userId));

    // Insert depot
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

    // Insert account
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

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Error && "format" in err) {
      return NextResponse.json(
        { error: "Invalid payload format", details: err },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await getUserId(req);

    await Promise.all([
      db.delete(rawDepotDataSet).where(eq(rawDepotDataSet.userId, userId)),
      db.delete(rawAccountDataSet).where(eq(rawAccountDataSet.userId, userId)),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
