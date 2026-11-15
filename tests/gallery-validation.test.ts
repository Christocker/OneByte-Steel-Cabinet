import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  MAX_GALLERY_DIMENSION,
  parseGalleryImage,
} from "../lib/gallery-validation.ts";

describe("parseGalleryImage", () => {
  it("accepts local gallery images", () => {
    assert.deepEqual(
      parseGalleryImage({ url: "/images/gallery/gallery-01.jpg", width: 900, height: 1600 }),
      { url: "/images/gallery/gallery-01.jpg", width: 900, height: 1600 }
    );
  });

  it("accepts Supabase Storage images and numeric strings", () => {
    const url =
      "https://abc.supabase.co/storage/v1/object/public/product-images/gallery/x.jpg";
    assert.deepEqual(parseGalleryImage({ url, width: "1200", height: "1600" }), {
      url,
      width: 1200,
      height: 1600,
    });
  });

  it("rejects invalid URLs", () => {
    assert.equal(parseGalleryImage({ url: "https://evil.example.com/a.jpg", width: 1, height: 1 }), null);
    assert.equal(parseGalleryImage({ url: "javascript:alert(1)", width: 1, height: 1 }), null);
    assert.equal(parseGalleryImage({ url: "", width: 1, height: 1 }), null);
  });

  it("rejects invalid dimensions", () => {
    for (const dimensions of [
      { width: 0, height: 100 },
      { width: 100, height: -1 },
      { width: 1.5, height: 100 },
      { width: 100, height: Number.NaN },
      { width: MAX_GALLERY_DIMENSION + 1, height: 100 },
    ]) {
      assert.equal(
        parseGalleryImage({ url: "/images/gallery/gallery-01.jpg", ...dimensions }),
        null
      );
    }
  });

  it("rejects non-objects", () => {
    assert.equal(parseGalleryImage(null), null);
    assert.equal(parseGalleryImage("photo"), null);
  });
});
