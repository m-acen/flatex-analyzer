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
} from "@/server/user-config-actions";
import { useStorageAdapter } from "./use-storage-adapter";

export type UserConfig = z.infer<typeof UserConfigSchema>;

const UserConfigContext = createContext<{
  config: UserConfig;
  updateConfig: (newConfig: Partial<UserConfig>) => Promise<void>;
} | null>(null);

export const useUserConfig = () => {
  const ctx = useContext(UserConfigContext);
  if (!ctx)
    throw new Error("useUserConfig must be used inside <UserConfigProvider />");
  return ctx;
};

const STORAGE_KEY = "user_config";

export const UserConfigProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const queryClient = useQueryClient();
  const { data: session, isPending } = useSession();

  const userConfigPersistenceMode = session?.user?.id
    ? DataPersistenceMode.SERVER
    : DataPersistenceMode.LOCAL;

  const adapter = useStorageAdapter<UserConfig>(userConfigPersistenceMode, {
    local: createLocalStorageAdapter<UserConfig>(STORAGE_KEY),
    server: {
      load: loadUserConfig,
      save: saveUserConfig,
      clear: clearUserConfig,
    },
  });

  useEffect(() => {
    queryClient.refetchQueries({ queryKey: ["user-config"] });
  }, [adapter]);

  const {
    data: config = undefined,
    isLoading,
  } = useQuery({
    queryKey: ["user-config"],
    queryFn: adapter.load,
    staleTime: Infinity,
    enabled: !isPending,
  });

  const mutation = useMutation({
    mutationFn: async (newConfig: Partial<UserConfig>) => {
      if (isPending) {
        throw new Error("Session is still pending, cannot update config");
      }
      const merged = { ...config, ...newConfig };
      const parsed = UserConfigSchema.parse(merged);
      await adapter.save(parsed);
      return parsed;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["user-config"], data);
    },
  });

  const updateConfig = async (newConfig: Partial<UserConfig>) => {
    await mutation.mutateAsync(newConfig);
  };

  if (isLoading || !config) {
    return <div>Loading user config...</div>;
  }

  return (
    <UserConfigContext.Provider value={{ config, updateConfig }}>
      {children}
    </UserConfigContext.Provider>
  );
};
