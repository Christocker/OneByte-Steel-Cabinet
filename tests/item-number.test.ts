import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { assignDisplayNumbers, nextItemNumberFrom } from "../lib/item-number.ts";

describe("nextItemNumberFrom", () => {
  it("starts at 1 for an empty catalog", () => {
    assert.equal(nextItemNumberFrom([]), 1);
  });

  it("returns one past the highest number", () => {
    assert.equal(nextItemNumberFrom([{ item_number: 1 }, { item_number: 5 }, { item_number: 3 }]), 6);
  });

  it("counts hidden rows too, so a hidden number is never reused", () => {
    // 23 was hidden (still stored) and 22 is the highest active number.
    const rows = [
      { item_number: 1 },
      { item_number: 22 },
      { item_number: 23 }, // hidden
    ];
    assert.equal(nextItemNumberFrom(rows), 24);
  });

  it("ignores invalid values", () => {
    const rows = [
      { item_number: 4 },
      { item_number: Number.NaN },
      { item_number: Number.POSITIVE_INFINITY },
    ];
    assert.equal(nextItemNumberFrom(rows), 5);
  });

  it("stays correct after many hides", () => {
    const rows = Array.from({ length: 50 }, (_, i) => ({ item_number: i + 1 }));
    assert.equal(nextItemNumberFrom(rows), 51);
  });
});

describe("assignDisplayNumbers", () => {
  it("assigns contiguous 1..N in array order", () => {
    const products = [{ id: "a" }, { id: "b" }, { id: "c" }];
    const numbered = assignDisplayNumbers(products);
    assert.deepEqual(
      numbered.map((p) => p.displayItemNumber),
      [1, 2, 3]
    );
  });

  it("preserves the original fields", () => {
    const numbered = assignDisplayNumbers([{ id: "a", name: "Cabinet" }]);
    assert.equal(numbered[0].id, "a");
    assert.equal(numbered[0].name, "Cabinet");
    assert.equal(numbered[0].displayItemNumber, 1);
  });

  it("re-flows to a continuous sequence when an item is removed", () => {
    const withHiddenRemoved = [{ item_number: 1 }, { item_number: 3 }, { item_number: 4 }];
    const numbered = assignDisplayNumbers(withHiddenRemoved);
    assert.deepEqual(
      numbered.map((p) => p.displayItemNumber),
      [1, 2, 3]
    );
    // Stored values are untouched.
    assert.deepEqual(
      numbered.map((p) => p.item_number),
      [1, 3, 4]
    );
  });

  it("does not mutate the input", () => {
    const input = [{ id: "a" }];
    assignDisplayNumbers(input);
    assert.equal("displayItemNumber" in input[0], false);
  });
});
