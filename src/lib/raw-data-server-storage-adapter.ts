import { AccountTransaction } from "@/features/dashboard/types/account-transaction";
import { DepotTransaction } from "@/features/dashboard/types/depot-transaction";
import {
  RawDepotTransactionDataSet,
  RawAccountTransactionDataSet,
  RawDataState,
} from "@/features/dashboard/types/raw-transaction-data-set";
import {
  loadRawDataSets,
  saveRawDataSets,
  clearRawDataSets,
} from "./raw-data-fetch";
import { StorageAdapter } from "./storage-adapter";

function base64ToUint8Array(base64: string): Uint8Array {
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

function uint8ArrayToBase64(arr: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < arr.length; i++) {
    binary += String.fromCharCode(arr[i]);
  }
  return btoa(binary);
}

export function generateKeyBase64(): string {
  const key = crypto.getRandomValues(new Uint8Array(32)); // 256-bit AES key
  return uint8ArrayToBase64(key);
}

async function encryptData<T>(data: T, base64Key: string): Promise<string> {
  console.log("Encrypting data with key:", base64Key);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const keyBuffer = base64ToUint8Array(base64Key);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );

  const encodedData = new TextEncoder().encode(JSON.stringify(data));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    encodedData
  );

  const combined = new Uint8Array(iv.byteLength + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.byteLength);

  return uint8ArrayToBase64(combined);
}

async function decryptData<T>(
  encryptedBase64: string,
  base64Key: string
): Promise<T> {
  const combined = base64ToUint8Array(encryptedBase64);
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);

  const keyBuffer = base64ToUint8Array(base64Key);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    ciphertext
  );

  const decodedData = new TextDecoder().decode(decrypted);
  return JSON.parse(decodedData) as T;
}

// === Storage Adapter ===

export function createServerAdapter(key: string): StorageAdapter<RawDataState> {
  return {
    load: async () => {
      const data = await loadRawDataSets();

      const decryptedDepot: RawDepotTransactionDataSet[] = await Promise.all(
        data.depot.map(async (d) => ({
          fileName: d.fileName,
          id: d.id,
          timestamp: d.timestamp,
          data: await decryptData<DepotTransaction[]>(d.encryptedData, key),
        }))
      );

      const decryptedAccount: RawAccountTransactionDataSet[] =
        await Promise.all(
          data.account.map(async (a) => ({
            fileName: a.fileName,
            id: a.id,
            timestamp: a.timestamp,
            data: await decryptData<AccountTransaction[]>(a.encryptedData, key),
          }))
        );

      return { depot: decryptedDepot, account: decryptedAccount };
    },

    save: async (data: RawDataState) => {
      const encryptedDepot = await Promise.all(
        data.depot.map(async (d) => ({
          ...d,
          encryptedData: await encryptData(d.data, key),
        }))
      );

      const encryptedAccount = await Promise.all(
        data.account.map(async (a) => ({
          ...a,
          encryptedData: await encryptData(a.data, key),
        }))
      );

      await saveRawDataSets({
        depot: encryptedDepot,
        account: encryptedAccount,
      });
    },

    clear: async () => {
      clearRawDataSets();
    },
  };
}
