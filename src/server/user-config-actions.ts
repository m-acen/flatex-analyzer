"use server";

import { db } from "@/db";
import { userConfig } from "@/db/schema/user-config";
import { UserConfig } from "@/hooks/use-user-config";
import { auth } from "@/lib/auth";
import { UserConfigSchema } from "@/lib/user-config";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

/**
 * Loads the current user's config.
 */
export async function loadUserConfig(): Promise<UserConfig> {
  const authHeaders = await headers();
  const session = await auth.api.getSession({ headers: authHeaders });
  if (!session?.user?.id) throw new Error("Not authenticated");

  const result = await db
    .select()
    .from(userConfig)
    .where(eq(userConfig.userId, session.user.id))
    .limit(1);

  if (result.length === 0) {
    return UserConfigSchema.parse({}); // default fallback
  }

  return UserConfigSchema.parse(result[0].settings);
}

/**
 * Saves (creates or updates) the current user's config.
 */
export async function saveUserConfig(
  newData: Partial<UserConfig>
): Promise<void> {
  const authHeaders = await headers();
  const session = await auth.api.getSession({ headers: authHeaders });
  if (!session?.user?.id) throw new Error("Not authenticated");

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
}

/**
 * Deletes the config for the current user.
 */
export async function clearUserConfig(): Promise<void> {
  const authHeaders = await headers();
  const session = await auth.api.getSession({ headers: authHeaders });
  if (!session?.user?.id) throw new Error("Not authenticated");

  await db.delete(userConfig).where(eq(userConfig.userId, session.user.id));
}
