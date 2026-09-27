// Pure helpers for cabinet item numbering.
//
// Two separate concerns:
//  - nextItemNumberFrom: the number to *store* for a new product. It always
//    exceeds every stored item_number, including hidden (inactive) rows, so a
//    number is never reused and no unique-constraint collision can occur.
//  - assignDisplayNumbers: the number to *show*. It assigns a contiguous 1..N
//    based on the order of the given list, so the storefront and admin always
//    display a continuous sequence without rewriting any stored data.

export function nextItemNumberFrom(rows: Array<{ item_number: number }>): number {
  let max = 0;
  for (const row of rows) {
    const value = Number(row.item_number);
    if (Number.isFinite(value) && value > max) {
      max = Math.floor(value);
    }
  }
  return max + 1;
}

export function assignDisplayNumbers<T>(
  products: readonly T[]
): Array<T & { displayItemNumber: number }> {
  return products.map((product, index) => ({
    ...product,
    displayItemNumber: index + 1,
  }));
}
