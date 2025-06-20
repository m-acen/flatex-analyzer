import { BaseRawData } from "@/lib/raw-data-schema";

export async function saveRawDataSets({
  depot,
  account,
}: {
  depot: BaseRawData[];
  account: BaseRawData[];
}): Promise<void> {
  const res = await fetch("/api/raw-data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ depot, account }),
  });

  if (!res.ok) {
    const { error } = await res.json().catch(() => ({}));
    throw new Error(`Failed to save raw data sets: ${error ?? res.statusText}`);
  }
}

export async function loadRawDataSets(): Promise<{
  depot: BaseRawData[];
  account: BaseRawData[];
}> {
  const res = await fetch("/api/raw-data", {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    const { error } = await res.json().catch(() => ({}));
    throw new Error(`Failed to load raw data sets: ${error ?? res.statusText}`);
  }

  return res.json();
}

export async function clearRawDataSets(): Promise<void> {
  const res = await fetch("/api/raw-data", {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const { error } = await res.json().catch(() => ({}));
    throw new Error(`Failed to clear raw data sets: ${error ?? res.statusText}`);
  }
}
