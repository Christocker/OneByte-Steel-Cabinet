import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildDimensions, parseDimensions } from "../lib/dimensions.ts";

describe("parseDimensions", () => {
  it("parses a canonical cm string", () => {
    assert.deepEqual(parseDimensions("180 × 80 × 40 cm"), {
      h: "180",
      w: "80",
      d: "40",
      unit: "cm",
    });
  });

  it("accepts x separators and inches", () => {
    assert.deepEqual(parseDimensions("185x90x45 in"), {
      h: "185",
      w: "90",
      d: "45",
      unit: "in",
    });
  });

  it("defaults to cm when the unit is missing", () => {
    assert.deepEqual(parseDimensions("100 × 50 × 50"), {
      h: "100",
      w: "50",
      d: "50",
      unit: "cm",
    });
  });

  it("returns an empty shape for unparseable input", () => {
    assert.deepEqual(parseDimensions("approx"), { h: "", w: "", d: "", unit: "cm" });
  });
});

describe("buildDimensions", () => {
  it("builds the display string", () => {
    assert.equal(buildDimensions("180", "80", "40", "cm"), "180 × 80 × 40 cm");
  });

  it("returns empty when a part is missing", () => {
    assert.equal(buildDimensions("", "80", "40", "cm"), "");
  });
});
