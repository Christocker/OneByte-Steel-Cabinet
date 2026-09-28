import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  MAX_PRICE_LENGTH,
  MAX_STOCK,
  parsePriceValue,
  parseStockValue,
} from "../lib/inventory-validation.ts";

describe("parseStockValue", () => {
  it("accepts zero and positive integers", () => {
    assert.equal(parseStockValue(0), 0);
    assert.equal(parseStockValue("12"), 12);
  });

  it("rejects negatives, decimals, and non-numeric strings", () => {
    assert.equal(parseStockValue(-1), null);
    assert.equal(parseStockValue("1.5"), null);
    assert.equal(parseStockValue("abc"), null);
    assert.equal(parseStockValue("-3"), null);
  });

  it("enforces the upper bound", () => {
    assert.equal(parseStockValue(MAX_STOCK), MAX_STOCK);
    assert.equal(parseStockValue(MAX_STOCK + 1), null);
  });
});

describe("parsePriceValue", () => {
  it("trims and returns valid prices", () => {
    assert.equal(parsePriceValue(" 5800 "), "5800");
    assert.equal(parsePriceValue("₱5,800"), "₱5,800");
  });

  it("rejects empty and oversized values", () => {
    assert.equal(parsePriceValue(""), null);
    assert.equal(parsePriceValue("   "), null);
    assert.equal(parsePriceValue("x".repeat(MAX_PRICE_LENGTH + 1)), null);
  });

  it("rejects non-strings", () => {
    assert.equal(parsePriceValue(5800), null);
  });
});
