import { DEFAULT_GALLERY, getGallery, type GalleryPhoto } from "@/lib/gallery";
import GalleryGrid from "./GalleryGrid";

export default async function Gallery() {
  let photos: GalleryPhoto[];

  try {
    photos = await getGallery();
  } catch (error) {
    // The gallery is non-critical: keep the previous seed visible if the table
    // has not been migrated yet or storage is temporarily unavailable.
    console.error("Gallery could not be loaded; using the fallback gallery.", error);
    photos = DEFAULT_GALLERY.map((photo) => ({ ...photo }));
  }

  return <GalleryGrid photos={photos} />;
}
