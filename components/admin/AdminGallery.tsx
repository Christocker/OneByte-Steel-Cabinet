"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { GalleryPhoto } from "@/lib/gallery";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

type AdminGalleryProps = {
  initialPhotos: GalleryPhoto[];
  storageAvailable: boolean;
  onUnauthorized: () => void;
};

function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new window.Image();
    image.onload = () => {
      const dimensions = { width: image.naturalWidth, height: image.naturalHeight };
      URL.revokeObjectURL(objectUrl);
      if (!dimensions.width || !dimensions.height) {
        reject(new Error("Image dimensions could not be read."));
        return;
      }
      resolve(dimensions);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Image could not be read."));
    };
    image.src = objectUrl;
  });
}

export default function AdminGallery({
  initialPhotos,
  storageAvailable,
  onUnauthorized,
}: AdminGalleryProps) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [noticeError, setNoticeError] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function showNotice(text: string, error = false) {
    setNotice(text);
    setNoticeError(error);
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (!storageAvailable) {
      showNotice("Gallery storage is not ready. Apply migration 009 in Supabase.", true);
      return;
    }

    setUploading(true);
    showNotice("");

    try {
      const added: GalleryPhoto[] = [];
      const skipped: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (!ALLOWED_TYPES.includes(file.type)) {
          skipped.push(`${file.name} (unsupported type)`);
          continue;
        }
        if (file.size > MAX_FILE_SIZE) {
          skipped.push(`${file.name} (over 5MB)`);
          continue;
        }

        try {
          const dimensions = await readImageDimensions(file);

          const formData = new FormData();
          formData.append("file", file);
          formData.append("product_id", "gallery");
          const uploadResponse = await fetch("/api/upload", {
            method: "POST",
            credentials: "same-origin",
            body: formData,
          });

          if (uploadResponse.status === 401) {
            onUnauthorized();
            return;
          }
          if (!uploadResponse.ok) {
            const error = (await uploadResponse.json().catch(() => ({}))) as {
              error?: string;
            };
            skipped.push(`${file.name} (${error.error || "upload failed"})`);
            continue;
          }

          const uploaded = (await uploadResponse.json()) as { url?: string };
          if (!uploaded.url) {
            skipped.push(`${file.name} (upload failed)`);
            continue;
          }

          const addResponse = await fetch("/api/gallery", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify({
              url: uploaded.url,
              width: dimensions.width,
              height: dimensions.height,
            }),
          });

          if (addResponse.status === 401) {
            onUnauthorized();
            return;
          }
          if (!addResponse.ok) {
            const error = (await addResponse.json().catch(() => ({}))) as {
              error?: string;
            };
            skipped.push(`${file.name} (${error.error || "could not be added"})`);
            continue;
          }

          const result = (await addResponse.json()) as { photo?: GalleryPhoto };
          if (result.photo) {
            added.push(result.photo);
          } else {
            skipped.push(`${file.name} (could not be added)`);
          }
        } catch {
          skipped.push(`${file.name} (could not be processed)`);
        }
      }

      if (added.length > 0) {
        setPhotos((current) =>
          [...current, ...added].sort((left, right) => left.position - right.position)
        );
      }

      if (added.length > 0 && skipped.length === 0) {
        showNotice(`${added.length} photo${added.length === 1 ? "" : "s"} added.`);
      } else if (added.length > 0) {
        showNotice(
          `${added.length} photo${added.length === 1 ? "" : "s"} added. Skipped: ${skipped.join(", ")}`,
          true
        );
      } else if (skipped.length > 0) {
        showNotice(`Could not add photos. ${skipped.join(", ")}`, true);
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function removePhoto(photo: GalleryPhoto) {
    if (removingId) return;
    if (!window.confirm("Remove this photo from the public gallery?")) return;

    setRemovingId(photo.id);
    showNotice("");

    try {
      const response = await fetch(`/api/gallery/${encodeURIComponent(photo.id)}`, {
        method: "DELETE",
        credentials: "same-origin",
      });

      if (response.status === 401) {
        onUnauthorized();
        return;
      }
      if (!response.ok) {
        const error = (await response.json().catch(() => ({}))) as { error?: string };
        showNotice(error.error || "Could not remove the photo.", true);
        return;
      }

      setPhotos((current) => current.filter((item) => item.id !== photo.id));
      showNotice("Photo removed from the public gallery.");
    } catch {
      showNotice("Could not remove the photo.", true);
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <section aria-labelledby="admin-gallery-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="admin-gallery-title" className="text-xl font-bold text-navy">
            Gallery
          </h2>
          <p className="mt-1 text-sm text-navy/60">
            {editing
              ? "Remove photos with the × button, or add new ones with the tile after the last photo."
              : "Photos shown in the public “In Use” gallery. Select Edit to add or remove photos."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setEditing((current) => !current)}
          disabled={!storageAvailable || uploading}
          aria-pressed={editing}
          className={`inline-flex items-center gap-2 rounded-xl border-2 px-5 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            editing
              ? "border-navy bg-navy text-white hover:bg-navy-light"
              : "border-navy/25 text-navy hover:bg-navy hover:text-white"
          }`}
        >
          {editing ? (
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12l5 5L20 7" />
            </svg>
          ) : (
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" />
            </svg>
          )}
          {editing ? "Done" : "Edit"}
        </button>
      </div>

      {!storageAvailable && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-amber-700/30 bg-amber-100/70 px-4 py-3 text-sm font-medium text-amber-900"
        >
          Gallery storage is not ready. Apply{" "}
          <code className="font-mono">supabase/migrations/009_cabinet_gallery.sql</code>{" "}
          in the Supabase SQL editor, then reload this page.
        </p>
      )}

      <p
        role={noticeError ? "alert" : "status"}
        aria-live="polite"
        className={`mt-4 min-h-5 text-sm font-semibold ${
          noticeError ? "text-red-700" : "text-emerald-800"
        }`}
      >
        {notice}
      </p>

      {photos.length === 0 && !editing ? (
        <p className="mt-2 rounded-2xl border-2 border-dashed border-beige-deep bg-beige-soft px-6 py-10 text-center text-sm font-medium text-navy/50">
          No gallery photos yet. Select Edit to add the first one.
        </p>
      ) : (
        <div className="mt-2 grid gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="group relative overflow-hidden rounded-2xl border-2 border-beige-deep bg-beige-soft shadow-lg shadow-navy/10"
            >
              <div className="relative aspect-[3/4] w-full bg-beige">
                <Image
                  src={photo.url}
                  alt={`Gallery photo ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover"
                />
              </div>
              <span className="absolute bottom-2 left-2 rounded-full bg-navy/80 px-2.5 py-1 text-[11px] font-bold text-white">
                Photo {index + 1}
              </span>

              {editing && (
                <button
                  type="button"
                  onClick={() => removePhoto(photo)}
                  disabled={removingId === photo.id}
                  aria-label={`Remove gallery photo ${index + 1}`}
                  title="Remove photo"
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border border-white/60 bg-white/85 text-navy shadow-lg backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-white hover:text-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy disabled:cursor-wait disabled:opacity-60"
                >
                  {removingId === photo.id ? (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-navy/30 border-t-navy" />
                  ) : (
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                    >
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          ))}

          {editing && (
            <label
              className={`group flex aspect-[3/4] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-beige-soft/60 px-4 text-center transition-colors ${
                uploading || !storageAvailable
                  ? "cursor-not-allowed border-beige-deep text-navy/30"
                  : "cursor-pointer border-beige-deep text-navy/55 hover:border-navy/40 hover:bg-beige-soft hover:text-navy"
              }`}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-current transition-transform duration-200 group-hover:scale-105">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
              <span className="mt-3 text-sm font-semibold">
                {uploading ? "Uploading..." : "Add photos"}
              </span>
              <span className="mt-1 text-[11px] font-medium">JPG, PNG, WebP · 5MB max</span>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                disabled={uploading || !storageAvailable}
                onChange={(event) => handleFiles(event.target.files)}
                className="hidden"
              />
            </label>
          )}
        </div>
      )}
    </section>
  );
}
