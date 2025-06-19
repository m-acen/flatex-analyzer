import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { userConfig } from "@/db/schema/user-config";
import { UserConfig } from "@/hooks/use-user-config";
import { UserConfigSchema } from "@/lib/user-config";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

/**
 * Load current user's config (GET)
 */
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id)
    return new NextResponse("Not authenticated", { status: 401 });

  const result = await db
    .select()
    .from(userConfig)
    .where(eq(userConfig.userId, session.user.id))
    .limit(1);

  const settings =
    result.length === 0
      ? UserConfigSchema.parse({})
      : UserConfigSchema.parse(result[0].settings);

  return NextResponse.json(settings);
}

/**
 * Save/update current user's config (PATCH)
 */
export async function PATCH(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id)
    return new NextResponse("Not authenticated", { status: 401 });

  const newData = await req.json();
  const result = await db
    .select()
    .from(userConfig)
    .where(eq(userConfig.userId, session.user.id))
    .limit(1);

  const existing: UserConfig = result[0]?.settings || {};
  const merged = { ...existing, ...newData };
  const validated = UserConfigSchema.parse(merged);

  if (result.length > 0) {
    await db
      .update(userConfig)
      .set({
        settings: validated,
        updatedAt: new Date(),
      })
      .where(eq(userConfig.userId, session.user.id));
  } else {
    await db.insert(userConfig).values({
      userId: session.user.id,
      settings: validated,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  return new NextResponse(null, { status: 204 });
}

/**
 * Delete current user's config (DELETE)
 */
export async function DELETE(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id)
    return new NextResponse("Not authenticated", { status: 401 });

  await db.delete(userConfig).where(eq(userConfig.userId, session.user.id));
  return new NextResponse(null, { status: 204 });
}
