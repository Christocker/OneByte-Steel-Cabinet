export const MAX_STOCK = 2_147_483_647;

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

function cleanPriceInput(value: string): string {
  return value.replace(/,/g, "").trim();
}

export function getPriceSaveError(value: string): string | null {
  const cleaned = cleanPriceInput(value);
  if (cleaned.length === 0) {
    return "Price must be greater than 0.";
  }
  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed)) {
    return "Enter a valid price (numbers only).";
  }
  if (parsed <= 0) {
    return "Price must be greater than 0.";
  }
  return null;
}

export function parsePriceValue(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const cleaned = cleanPriceInput(value);
  if (cleaned.length === 0) return null;
  const parsed = Number(cleaned);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

export function getStockInputError(value: string): string | null {
  if (value.length === 0) {
    return "Enter a stock quantity.";
  }

  if (!/^\d+$/.test(value)) {
    return "Use whole numbers only, from 0 upward.";
  }

  if (parseStockValue(value) === null) {
    return `Stock must be between 0 and ${MAX_STOCK.toLocaleString()}.`;
  }

  return null;
}
