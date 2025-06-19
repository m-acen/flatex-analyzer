import React, { createContext, useContext, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { z } from "zod";
import {
  createLocalStorageAdapter,
  StorageAdapter,
} from "@/lib/storage-adapter";
import { useSession } from "@/lib/auth-client";
import { UserConfigSchema, DataPersistenceMode } from "@/lib/user-config";
import {
  clearUserConfig,
  loadUserConfig,
  saveUserConfig,
} from "@/lib/user-config-fetch";

export type UserConfig = z.infer<typeof UserConfigSchema>;

// Define a default configuration to use when none is loaded.
const defaultUserConfig: UserConfig = {
  dataPersistenceMode: DataPersistenceMode.LOCAL,
  // ... add other default values for your config schema
};

const UserConfigContext = createContext<{
  config: UserConfig | null;
  updateConfig: (newConfig: Partial<UserConfig>) => Promise<UserConfig>;
  isLoading: boolean;
} | null>(null);

export const useUserConfig = () => {
  const ctx = useContext(UserConfigContext);
  if (!ctx)
    throw new Error("useUserConfig must be used inside <UserConfigProvider />");
  return ctx;
};

const STORAGE_KEY = "user_config";

// The map of available storage adapters remains the same.
const userConfigAdapterMap: Partial<
  Record<DataPersistenceMode, StorageAdapter<UserConfig>>
> = {
  local: createLocalStorageAdapter<UserConfig>(STORAGE_KEY),
  server: {
    load: loadUserConfig,
    save: saveUserConfig,
    clear: clearUserConfig,
  },
};

export const UserConfigProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: session, isPending: isSessionLoading } = useSession();
  const queryClient = useQueryClient();

  // Determine the active persistence mode based on session status.
  const persistenceMode: DataPersistenceMode = session?.user ? DataPersistenceMode.SERVER : DataPersistenceMode.LOCAL;

  // The query key includes the user's ID (or 'local') to ensure data is
  // refetched automatically when the user logs in or out.
  const queryKey = useMemo(
    () => ["userConfig", session?.user?.id ?? "local"],
    [session?.user?.id],
  );

  // useQuery to fetch the user configuration.
  const { data: configData, isLoading: isConfigLoading } = useQuery({
    queryKey: queryKey,
    queryFn: async () => {
      // Select the adapter based on the user's login state.
      const adapter = userConfigAdapterMap[persistenceMode];
      if (!adapter) {
        console.warn(`No storage adapter found for mode: ${persistenceMode}`);
        return defaultUserConfig;
      }
      const loadedConfig = await adapter.load();
      // Ensure we always return a valid config object.
      return loadedConfig ? UserConfigSchema.parse(loadedConfig) : defaultUserConfig;
    },
    // This ensures that if a user logs in, we don't flash the old 'local' data.
    enabled: !isSessionLoading,
  });

  // useMutation for updating the configuration.
  const { mutateAsync: updateConfigMutation } = useMutation({
    mutationFn: async (newConfig: Partial<UserConfig>) => {
      // Select the same adapter for saving.
      const adapter = userConfigAdapterMap[persistenceMode];
      if (!adapter?.save) throw new Error("Saving is not supported.");

      // Merge the new config with the existing one.
      const currentConfig = configData ?? defaultUserConfig;
      const mergedConfig: UserConfig = { ...currentConfig, ...newConfig };
      await adapter.save(mergedConfig);
      return mergedConfig;
    },
    // After a successful mutation, update the query data.
    onSuccess: (updatedConfig) => {
      console.log("User config updated:", updatedConfig);
      queryClient.setQueryData(queryKey, updatedConfig);
    },
  });

  // The final config object, falling back to default if still loading.
  const config = configData ?? null;

  const value = {
    config,
    updateConfig: updateConfigMutation,
    // The overall loading state is true if the session or the config is loading.
    isLoading: isSessionLoading || isConfigLoading,
  };

  return (
    <UserConfigContext.Provider value={value}>
      {children}
    </UserConfigContext.Provider>
  );
};