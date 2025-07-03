import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { get, set } from "idb-keyval";
import { z } from "zod";

const INDEXEDDB_KEY = "encryptionKey";

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

const base64KeySchema = z
  .string()
  .refine((str) => {
    try {
      const bytes = Uint8Array.from(atob(str), (c) => c.charCodeAt(0));
      return bytes.length === 32;
    } catch {
      return false;
    }
  }, { message: "Encryption key must be a valid base64-encoded 256-bit key" });

async function generateCryptoKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );
}

async function exportCryptoKeyToBase64(key: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey("raw", key);
  return btoa(String.fromCharCode(...new Uint8Array(raw)));
}

/* ------------------------------------------------------------------ */
/*  The hook                                                          */
/* ------------------------------------------------------------------ */

export function useEncryptionKey() {
  const queryClient = useQueryClient();

  /* ----- main query: fetch (or create) the key -------------------- */
  const {
    data: base64,
    isLoading,
    error: queryError,
  } = useQuery<string, Error>({
    // the key is stored once; keep it forever in cache
    queryKey: [INDEXEDDB_KEY],
    staleTime: Infinity,
    queryFn: async () => {
      const stored = await get<string>(INDEXEDDB_KEY);
      if (stored && base64KeySchema.safeParse(stored).success) {
        return stored; // ✅ already valid
      }

      // ⬇️ generate, save and return a fresh key
      const key = await generateCryptoKey();
      const b64 = await exportCryptoKeyToBase64(key);
      await set(INDEXEDDB_KEY, b64);
      return b64;
    },
  });

  /* ----- helpers reused by both mutations ------------------------ */
  const saveKey = useCallback(async (newB64: string) => {
    const result = base64KeySchema.safeParse(newB64);
    if (!result.success) throw new Error(result.error.message);
    await set(INDEXEDDB_KEY, newB64);
    return newB64;
  }, []);

  /* ----- user-supplied key --------------------------------------- */
  const setKeyMutation = useMutation({
    mutationFn: saveKey,
    onSuccess: (b64) => {
      queryClient.setQueryData([INDEXEDDB_KEY], b64);
    },
  });

  /* ----- regenerate a brand-new key ------------------------------ */
  const regenerateKeyMutation = useMutation({
    mutationFn: async () => {
      const key = await generateCryptoKey();
      const b64 = await exportCryptoKeyToBase64(key);
      await set(INDEXEDDB_KEY, b64);
      return b64;
    },
    onSuccess: (b64) => {
      queryClient.setQueryData([INDEXEDDB_KEY], b64);
    },
  });

  /* ----- API returned by the hook -------------------------------- */
  return {
    key: base64 ?? null,
    setKey: (b64: string) => setKeyMutation.mutateAsync(b64),
    regenerateKey: () => regenerateKeyMutation.mutateAsync(),
    error:
      (queryError?.message) ??
      (setKeyMutation.error as Error | undefined)?.message ??
      (regenerateKeyMutation.error as Error | undefined)?.message ??
      null,
    isLoading:
      isLoading || setKeyMutation.isPending || regenerateKeyMutation.isPending,
  };
}
