export const MAX_IMAGES = 8;
const MAX_URL_LENGTH = 2048;

// Accepts only local paths ("/images/...") or absolute https URLs, with sane
// bounds, so a bad value can never crash the storefront's <Image> renderer.
export function sanitizeImageUrls(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  if (value.length > MAX_IMAGES) return null;

  const out: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") return null;
    const url = item.trim();
    if (url.length === 0 || url.length > MAX_URL_LENGTH) return null;
    if (!url.startsWith("/") && !url.startsWith("https://")) return null;
    out.push(url);
  }
  return out;
}
