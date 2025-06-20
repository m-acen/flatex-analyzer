import { UserConfig } from "@/hooks/use-user-config";
import { UserConfigSchema } from "@/lib/user-config-schema";

/**
 * Loads the current user's config via API.
 */
export async function loadUserConfig(): Promise<UserConfig> {
  const res = await fetch("/api/user-config", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to load user config");
  }

  const data = await res.json();
  return UserConfigSchema.parse(data);
}

/**
 * Saves (creates or updates) the current user's config via API.
 */
export async function saveUserConfig(
  newData: Partial<UserConfig>
): Promise<void> {
  const res = await fetch("/api/user-config", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(newData),
  });

  if (!res.ok) {
    throw new Error("Failed to save user config");
  }
}

/**
 * Deletes the config for the current user via API.
 */
export async function clearUserConfig(): Promise<void> {
  const res = await fetch("/api/user-config", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to clear user config");
  }
}
