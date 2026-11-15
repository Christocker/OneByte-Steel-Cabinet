import { randomBytes } from "node:crypto";
import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import gallerySeed from "@/data/gallery.json";
import { parseGalleryImage, type GalleryImageInput } from "./gallery-validation";

const LOCAL_GALLERY_FILE = path.join(process.cwd(), "data", "gallery.json");

export type GalleryPhoto = {
  id: string;
  url: string;
  width: number;
  height: number;
  position: number;
  created_at?: string;
};

type SupabaseConfig = {
  baseUrl: string;
  key: string;
  authorization?: string;
};

export class GalleryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GalleryError";
  }
}

export class GalleryValidationError extends GalleryError {
  constructor(message: string) {
    super(message);
    this.name = "GalleryValidationError";
  }
}

export class GalleryConfigurationError extends GalleryError {
  constructor(message: string) {
    super(message);
    this.name = "GalleryConfigurationError";
  }
}

// Static fallback used in development and while migration 009 has not been
// applied yet, so the public gallery never disappears during deployment.
export const DEFAULT_GALLERY: GalleryPhoto[] = gallerySeed;

function getSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.SUPABASE_URL?.trim();
  const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();
  const legacyServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const key = secretKey || legacyServiceRoleKey;

  if (!url || !key) {
    if (process.env.NODE_ENV === "production") {
      throw new GalleryConfigurationError(
        "SUPABASE_URL and SUPABASE_SECRET_KEY must be configured in production."
      );
    }
    return null;
  }

  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== "https:" && process.env.NODE_ENV === "production") {
      throw new Error("Supabase URL must use HTTPS.");
    }
    return {
      baseUrl: url.replace(/\/+$/, ""),
      key,
      ...(secretKey ? {} : { authorization: `Bearer ${legacyServiceRoleKey}` }),
    };
  } catch {
    throw new GalleryConfigurationError("SUPABASE_URL is not a valid URL.");
  }
}

function headers(config: SupabaseConfig, extra?: Record<string, string>): HeadersInit {
  const result: Record<string, string> = { apikey: config.key, ...extra };
  if (config.authorization) result.Authorization = config.authorization;
  return result;
}

function parsePhoto(row: unknown): GalleryPhoto {
  if (!row || typeof row !== "object") {
    throw new GalleryError("Gallery storage returned an invalid row.");
  }
  const value = row as Record<string, unknown>;
  const id = typeof value.id === "string" ? value.id : "";
  const url = typeof value.url === "string" ? value.url : "";
  const width = Number(value.width ?? 0);
  const height = Number(value.height ?? 0);
  const position = Number(value.position ?? value.sort_order ?? 0);

  if (
    !id ||
    !url ||
    !Number.isInteger(width) ||
    width <= 0 ||
    !Number.isInteger(height) ||
    height <= 0
  ) {
    throw new GalleryError("Gallery storage returned an invalid photo.");
  }

  return {
    id,
    url,
    width,
    height,
    position: Number.isFinite(position) ? Math.max(0, Math.floor(position)) : 0,
    ...(typeof value.created_at === "string" ? { created_at: value.created_at } : {}),
  };
}

function sortPhotos(photos: GalleryPhoto[]): GalleryPhoto[] {
  return [...photos].sort((left, right) => {
    if (left.position !== right.position) return left.position - right.position;
    if (left.created_at && right.created_at) {
      return left.created_at.localeCompare(right.created_at);
    }
    return left.id.localeCompare(right.id);
  });
}

async function readSupabaseGallery(config: SupabaseConfig): Promise<GalleryPhoto[]> {
  const response = await fetch(
    `${config.baseUrl}/rest/v1/cabinet_gallery?select=*&order=sort_order.asc,created_at.asc`,
    { headers: headers(config), cache: "no-store" }
  );

  if (response.status === 404) {
    throw new GalleryConfigurationError(
      "The gallery table is missing. Apply migration 009_cabinet_gallery.sql in Supabase."
    );
  }
  if (!response.ok) {
    throw new GalleryError(`Gallery request failed with status ${response.status}.`);
  }

  const data = (await response.json()) as unknown;
  if (!Array.isArray(data)) {
    throw new GalleryError("Gallery storage returned an invalid response.");
  }
  return sortPhotos(data.map(parsePhoto));
}

async function readLocalGallery(): Promise<GalleryPhoto[]> {
  try {
    const data = await readFile(LOCAL_GALLERY_FILE, "utf8");
    const parsed = JSON.parse(data) as unknown;
    if (!Array.isArray(parsed)) {
      throw new GalleryError("Local gallery storage returned an invalid response.");
    }
    return sortPhotos(parsed.map(parsePhoto));
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return sortPhotos(DEFAULT_GALLERY.map((photo) => ({ ...photo })));
    }
    if (error instanceof GalleryError) throw error;
    throw new GalleryError("Local gallery storage could not be read.");
  }
}

async function writeLocalGallery(photos: GalleryPhoto[]): Promise<void> {
  const temporaryFile = `${LOCAL_GALLERY_FILE}.${process.pid}.tmp`;
  await writeFile(temporaryFile, `${JSON.stringify(sortPhotos(photos), null, 2)}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });
  await rename(temporaryFile, LOCAL_GALLERY_FILE);
}

export async function getGallery(): Promise<GalleryPhoto[]> {
  const config = getSupabaseConfig();
  if (config) return readSupabaseGallery(config);
  return readLocalGallery();
}

export async function addGalleryPhoto(input: unknown): Promise<GalleryPhoto> {
  const image: GalleryImageInput | null = parseGalleryImage(input);
  if (!image) {
    throw new GalleryValidationError(
      "Photo must be a valid local or Supabase Storage image with width and height."
    );
  }

  const config = getSupabaseConfig();
  if (config) {
    const photos = await readSupabaseGallery(config);
    const position = photos.reduce((max, photo) => Math.max(max, photo.position), 0) + 1;
    const id = `gallery-${Date.now()}-${randomBytes(4).toString("hex")}`;
    const photo: GalleryPhoto = {
      id,
      url: image.url,
      width: image.width,
      height: image.height,
      position,
      created_at: new Date().toISOString(),
    };

    const response = await fetch(`${config.baseUrl}/rest/v1/cabinet_gallery`, {
      method: "POST",
      headers: headers(config, {
        "Content-Type": "application/json",
        Prefer: "return=representation",
      }),
      body: JSON.stringify({
        id: photo.id,
        url: photo.url,
        width: photo.width,
        height: photo.height,
        sort_order: photo.position,
      }),
      cache: "no-store",
    });

    if (response.status === 404) {
      throw new GalleryConfigurationError(
        "The gallery table is missing. Apply migration 009_cabinet_gallery.sql in Supabase."
      );
    }
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new GalleryError(
        `Gallery photo could not be added (${response.status})${detail ? `: ${detail}` : "."}`
      );
    }

    const saved = (await response.json()) as unknown;
    if (!Array.isArray(saved) || saved.length === 0) {
      throw new GalleryError("Gallery storage did not return the saved photo.");
    }
    return parsePhoto(saved[0]);
  }

  const photos = await readLocalGallery();
  const position = photos.reduce((max, photo) => Math.max(max, photo.position), 0) + 1;
  const photo: GalleryPhoto = {
    id: `gallery-${Date.now()}-${randomBytes(4).toString("hex")}`,
    url: image.url,
    width: image.width,
    height: image.height,
    position,
    created_at: new Date().toISOString(),
  };
  await writeLocalGallery([...photos, photo]);
  return photo;
}

export async function deleteGalleryPhoto(id: string): Promise<void> {
  if (!id) throw new GalleryValidationError("A gallery photo id is required.");

  const config = getSupabaseConfig();
  if (config) {
    const photos = await readSupabaseGallery(config);
    if (!photos.some((photo) => photo.id === id)) {
      throw new GalleryError("Photo not found.");
    }

    const response = await fetch(
      `${config.baseUrl}/rest/v1/cabinet_gallery?id=eq.${encodeURIComponent(id)}`,
      { method: "DELETE", headers: headers(config), cache: "no-store" }
    );

    if (response.status === 404) {
      throw new GalleryConfigurationError(
        "The gallery table is missing. Apply migration 009_cabinet_gallery.sql in Supabase."
      );
    }
    if (!response.ok) {
      throw new GalleryError(`Gallery photo could not be removed (${response.status}).`);
    }
    return;
  }

  const photos = await readLocalGallery();
  const next = photos.filter((photo) => photo.id !== id);
  if (next.length === photos.length) {
    throw new GalleryError("Photo not found.");
  }
  await writeLocalGallery(next);
}
