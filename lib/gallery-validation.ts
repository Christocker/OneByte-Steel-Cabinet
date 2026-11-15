import { sanitizeImageUrls } from "./image-urls.ts";

export const MAX_GALLERY_DIMENSION = 100_000;

export type GalleryImageInput = {
  url: string;
  width: number;
  height: number;
};

function parseDimension(value: unknown): number | null {
  const dimension =
    typeof value === "number"
      ? value
      : typeof value === "string" && /^\d+$/.test(value)
        ? Number(value)
        : Number.NaN;

  if (
    !Number.isInteger(dimension) ||
    dimension <= 0 ||
    dimension > MAX_GALLERY_DIMENSION
  ) {
    return null;
  }
  return dimension;
}

export function parseGalleryImage(value: unknown): GalleryImageInput | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as { url?: unknown; width?: unknown; height?: unknown };

  const url = typeof candidate.url === "string" ? candidate.url.trim() : "";
  if (!url) return null;
  const sanitized = sanitizeImageUrls([url]);
  if (!sanitized || sanitized.length !== 1) return null;

  const width = parseDimension(candidate.width);
  const height = parseDimension(candidate.height);
  if (width === null || height === null) return null;

  return { url: sanitized[0], width, height };
}
