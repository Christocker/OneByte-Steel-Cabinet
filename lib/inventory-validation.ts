export const MAX_STOCK = 2_147_483_647;
export const MAX_PRICE_LENGTH = 100;

export function parseStockValue(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isSafeInteger(value) && value >= 0 && value <= MAX_STOCK
      ? value
      : null;
  }

  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    return null;
  }

  const stock = Number(value);
  return Number.isSafeInteger(stock) && stock >= 0 && stock <= MAX_STOCK
    ? stock
    : null;
}

export function parsePriceValue(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_PRICE_LENGTH) return null;
  return trimmed;
}
