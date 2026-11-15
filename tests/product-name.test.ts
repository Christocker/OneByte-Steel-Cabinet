import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { capitalizeWordStarts, toTitleCase } from "../lib/product-name.ts";

describe("toTitleCase", () => {
  it("capitalizes every word in lowercase product names", () => {
    assert.equal(
      toTitleCase("Half glass cabinet with 2 drawers"),
      "Half Glass Cabinet With 2 Drawers"
    );
    assert.equal(
      toTitleCase("Wardrobe shelves without drawers (4 doors) - Pink print"),
      "Wardrobe Shelves Without Drawers (4 Doors) - Pink Print"
    );
  });

  it("normalizes all-caps product names", () => {
    assert.equal(
      toTitleCase("FULL GLASS CABINET — LIGHT GRAY"),
      "Full Glass Cabinet — Light Gray"
    );
  });

  it("preserves intentional internal capitals", () => {
    assert.equal(toTitleCase("OneByte steel cabinet"), "OneByte Steel Cabinet");
    assert.equal(toTitleCase("iPhone display cabinet"), "iPhone Display Cabinet");
  });

  it("capitalizes hyphenated and slashed parts separately", () => {
    assert.equal(
      toTitleCase("lateral filing cabinet 4-drawers"),
      "Lateral Filing Cabinet 4-Drawers"
    );
    assert.equal(toTitleCase("half-glass/sliding"), "Half-Glass/Sliding");
  });

  it("handles apostrophes without changing punctuation", () => {
    assert.equal(toTitleCase("WOMEN'S wardrobe"), "Women's Wardrobe");
  });

  it("normalizes existing catalog names to full title case", () => {
    assert.equal(
      toTitleCase("Wardrobe with Shelves — Print Pink"),
      "Wardrobe With Shelves — Print Pink"
    );
    assert.equal(
      toTitleCase("Lateral Filing Cabinet 4-Drawers"),
      "Lateral Filing Cabinet 4-Drawers"
    );
  });

  it("preserves spacing", () => {
    assert.equal(toTitleCase("  full   glass  "), "  Full   Glass  ");
  });
});

describe("capitalizeWordStarts", () => {
  it("title-cases as the user types without lowercasing input", () => {
    assert.equal(
      capitalizeWordStarts("half glass cabinet with 2 drawers"),
      "Half Glass Cabinet With 2 Drawers"
    );
    assert.equal(
      capitalizeWordStarts("wardrobe shelves without drawers (4 doors) - Pink print"),
      "Wardrobe Shelves Without Drawers (4 Doors) - Pink Print"
    );
  });

  it("does not destroy intentionally typed capitals", () => {
    assert.equal(capitalizeWordStarts("FULL GLASS"), "FULL GLASS");
    assert.equal(capitalizeWordStarts("OneByte cabinet"), "OneByte Cabinet");
  });

  it("capitalizes parts after a hyphen", () => {
    assert.equal(capitalizeWordStarts("4-drawers"), "4-Drawers");
  });
});
