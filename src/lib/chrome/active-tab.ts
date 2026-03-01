import type { SessionLookupFailure } from "@/types/session";

export async function getActiveTab(): Promise<chrome.tabs.Tab | null> {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });

  return tab ?? null;
}

export function isInjectablePage(url: string): boolean {
  try {
    const parsedUrl = new URL(url);

    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
}

export function buildFailure(
  code: SessionLookupFailure["code"],
  message: string,
): SessionLookupFailure {
  return {
    ok: false,
    code,
    message,
  };
}
