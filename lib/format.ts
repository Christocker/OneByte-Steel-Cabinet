export function formatPriceDisplay(value: string | number): string {
  const text = typeof value === "number" ? String(value) : value.trim();
  if (text.length === 0) return "";

  const cleaned = text.replace(/₱/g, "").trim();
  if (cleaned.length === 0) return "₱";

  const noCommas = cleaned.replace(/,/g, "");
  const splitAtDigit = noCommas.match(/^([^\d]*)(\d+.*)$/);

  if (!splitAtDigit) {
    return `₱${cleaned}`;
  }

  const prefix = splitAtDigit[1];
  const rest = splitAtDigit[2];
  const digitMatch = rest.match(/^(\d+)(.*)$/);

  if (!digitMatch) {
    return `₱${cleaned}`;
  }

  const leadingDigits = digitMatch[1];
  const suffix = digitMatch[2];
  const grouped = leadingDigits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const xMatch = suffix.match(/^([xX]+)(.*)$/);
  if (xMatch) {
    return `₱${prefix}${grouped},${xMatch[1]}${xMatch[2] ?? ""}`;
  }

  return `₱${prefix}${grouped}${suffix}`;
}

export function formatPriceInput(raw: string): string {
  const cleaned = raw.replace(/,/g, "");
  return cleaned.replace(/\B(?=(\w{3})+(?!\w))/g, ",");
}
