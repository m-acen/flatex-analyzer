import { useEffect, useState, useCallback } from "react";
import { get, set, del } from "idb-keyval";
import { z } from "zod";

const INDEXEDDB_KEY = "encryptionKey";

// === Zod schema: 32-byte base64 string ===
const base64KeySchema = z
    .string()
    .refine((str) => {
        try {
            const bytes = Uint8Array.from(atob(str), (c) => c.charCodeAt(0));
            return bytes.length === 32;
        } catch {
            return false;
        }
    }, {
        message: "Encryption key must be a valid base64-encoded 256-bit key",
    });

// === Utility to generate a new extractable CryptoKey ===
async function generateCryptoKey(): Promise<CryptoKey> {
    return crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true, // ✅ extractable
        ["encrypt", "decrypt"]
    );
}

// === Utility to export CryptoKey to base64 ===
async function exportCryptoKeyToBase64(key: CryptoKey): Promise<string> {
    const raw = await crypto.subtle.exportKey("raw", key);
    const byteArray = new Uint8Array(raw);
    return btoa(String.fromCharCode(...byteArray));
}

// === Utility to import from base64 to CryptoKey ===
async function importKeyFromBase64(b64: string): Promise<CryptoKey> {
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    return crypto.subtle.importKey(
        "raw",
        bytes,
        { name: "AES-GCM" },
        true,
        ["encrypt", "decrypt"]
    );
}

// === Hook ===
export function useEncryptionKey() {
    const [key, setKeyInternal] = useState<CryptoKey | null>(null);
    const [base64, setBase64] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const validateAndStore = useCallback(async (newKeyB64: string) => {
        const result = base64KeySchema.safeParse(newKeyB64);
        if (result.success) {
            try {
                const cryptoKey = await importKeyFromBase64(newKeyB64);
                await set(INDEXEDDB_KEY, newKeyB64);
                setKeyInternal(cryptoKey);
                setBase64(newKeyB64);
                setError(null);
            } catch (e) {
                setError("Failed to import the key.");
            }
        } else {
            setError(result.error.message);
        }
    }, []);

    const regenerateKey = useCallback(async () => {
        try {
            const newKey = await generateCryptoKey();
            const b64 = await exportCryptoKeyToBase64(newKey);
            await validateAndStore(b64);
        } catch (e) {
            setError("Failed to generate a new key.");
        }
    }, [validateAndStore]);

    const setKey = useCallback(async (newKey: string) => {
        await validateAndStore(newKey);
    }, [validateAndStore]);

    useEffect(() => {
        (async () => {
            const stored = await get<string>(INDEXEDDB_KEY);
            if (stored) {
                await validateAndStore(stored);
            } else {
                await regenerateKey();
            }
        })();
    }, [regenerateKey, validateAndStore]);

    return {
        key: base64,
        setKey,
        regenerateKey,
        error,
    };
}
