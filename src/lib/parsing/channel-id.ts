export function parseChannelIdFromUrl(url: string): string | null {
  try {
    const parsedUrl = new URL(url);
    const match = parsedUrl.pathname.match(/^\/c\/([^/]+)$/);

    return match?.[1] ?? null;
  } catch {
    return null;
  }
}
