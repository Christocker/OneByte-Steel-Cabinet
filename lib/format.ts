const priceNumberFormatter = new Intl.NumberFormat("en-US");

function toFiniteNumber(value: string | number): number {
  if (typeof value === "number") return value;
  const parsed = Number(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : NaN;
}

export function formatCurrency(value: string | number): string {
  const parsed = toFiniteNumber(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return "";
  return `₱${priceNumberFormatter.format(Math.trunc(parsed))}`;
}

export function formatPriceInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
