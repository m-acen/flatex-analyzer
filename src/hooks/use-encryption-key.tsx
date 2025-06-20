import { useEffect, useState, useCallback } from "react";
import { z } from "zod";

const LOCAL_STORAGE_KEY = "encryptionKey";

// === Zod schema: 32-byte base64 string ===
const base64KeySchema = z
    .string()
    .refine((str) => {
        try {
            const bytes = Uint8Array.from(atob(str), c => c.charCodeAt(0));
            return bytes.length === 32;
        } catch {
            return false;
        }
    }, {
        message: "Encryption key must be a valid base64-encoded 256-bit key",
    });

// === Utility to generate a new base64 AES-256 key ===
function generateKeyBase64(): string {
    const key = crypto.getRandomValues(new Uint8Array(32));
    return btoa(String.fromCharCode(...key));
}

// === Hook ===
export function useEncryptionKey() {
    const [key, setKeyInternal] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const validateAndStore = useCallback((newKey: string) => {
        const result = base64KeySchema.safeParse(newKey);
        if (result.success) {
            localStorage.setItem(LOCAL_STORAGE_KEY, newKey);
            setKeyInternal(newKey);
            setError(null);
        } else {
            setError(result.error.message);
        }
    }, []);

    const regenerateKey = useCallback(() => {
        const newKey = generateKeyBase64();
        validateAndStore(newKey);
    }, [validateAndStore]);

    const setKey = useCallback((newKey: string) => {
        validateAndStore(newKey);
    }, [validateAndStore]);

    useEffect(() => {
        const storedKey = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedKey) {
            validateAndStore(storedKey);
        } else {
            regenerateKey();
        }
    }, [regenerateKey, validateAndStore]);

    return {
        key,
        setKey,
        regenerateKey,
        error,
    };
}
