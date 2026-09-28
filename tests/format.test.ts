import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatPriceDisplay, formatPriceInput } from "../lib/format.ts";

describe("formatPriceDisplay", () => {
  it("adds the peso sign and thousands separators", () => {
    assert.equal(formatPriceDisplay("5800"), "₱5,800");
  });

  it("accepts an existing peso sign", () => {
    assert.equal(formatPriceDisplay("₱5,800"), "₱5,800");
  });

  it("preserves non-numeric prices", () => {
    assert.equal(formatPriceDisplay("Call for price"), "₱Call for price");
  });

  it("handles empty values", () => {
    assert.equal(formatPriceDisplay(""), "");
  });
});

describe("formatPriceInput", () => {
  it("groups digits", () => {
    assert.equal(formatPriceInput("1234567"), "1,234,567");
  });

  it("keeps a decimal untouched", () => {
    assert.equal(formatPriceInput("1234.56"), "1,234.56");
  });

  it("does not split a numeric suffix", () => {
    assert.equal(formatPriceInput("500x"), "500x");
    assert.equal(formatPriceInput("5800x2"), "5,800x2");
  });
});
