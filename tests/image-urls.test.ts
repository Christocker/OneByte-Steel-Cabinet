import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MAX_IMAGES, sanitizeImageUrls } from "../lib/image-urls.ts";

describe("sanitizeImageUrls", () => {
  it("accepts local image paths", () => {
    assert.deepEqual(sanitizeImageUrls(["/images/products/a.png"]), [
      "/images/products/a.png",
    ]);
  });

  it("accepts Supabase storage URLs", () => {
    const url =
      "https://abc.supabase.co/storage/v1/object/public/product-images/x.jpg";
    assert.deepEqual(sanitizeImageUrls([url]), [url]);
  });

  it("rejects other hosts, insecure schemes, and scripts", () => {
    assert.equal(sanitizeImageUrls(["https://evil.example.com/a.png"]), null);
    assert.equal(sanitizeImageUrls(["http://abc.supabase.co/storage/v1/object/x"]), null);
    assert.equal(sanitizeImageUrls(["javascript:alert(1)"]), null);
  });

  it("rejects non-arrays and non-strings", () => {
    assert.equal(sanitizeImageUrls("nope"), null);
    assert.equal(sanitizeImageUrls([1]), null);
    assert.equal(sanitizeImageUrls([{}]), null);
  });

  it("enforces the maximum count", () => {
    const many = Array.from(
      { length: MAX_IMAGES + 1 },
      (_, index) => `/images/${index}.png`
    );
    assert.equal(sanitizeImageUrls(many), null);
  });

  it("accepts empty arrays", () => {
    assert.deepEqual(sanitizeImageUrls([]), []);
  });
});
