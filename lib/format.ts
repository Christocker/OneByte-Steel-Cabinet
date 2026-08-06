export function formatPriceDisplay(value: string | number): string {
  const text = typeof value === "number" ? String(value) : value.trim();
  if (text.length === 0) return "";

  const cleaned = text.replace(/₱/g, "").trim();
  if (cleaned.length === 0) return "₱";

  // CASE 3 — does NOT start with a digit: preserve the string exactly
  if (!/^\d/.test(cleaned)) {
    return `₱${cleaned}`;
  }

  // CASE 1 & 2 — starts with a digit: format only the leading numeric run
  const runMatch = cleaned.match(/^[\d,.]*/);
  const leadingRun = runMatch?.[0] ?? "";
  const suffix = cleaned.slice(leadingRun.length);

  let integerPart = leadingRun.replace(/,/g, "");
  let decimalPart = "";

  const dotIndex = integerPart.indexOf(".");
  if (dotIndex !== -1) {
    decimalPart = integerPart.slice(dotIndex);
    integerPart = integerPart.slice(0, dotIndex);
  }

  const grouped = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const xMatch = suffix.match(/^([xX]+)(.*)$/);
  if (xMatch) {
    return `₱${grouped}${decimalPart},${xMatch[1]}${xMatch[2] ?? ""}`;
  }

  return `₱${grouped}${decimalPart}${suffix}`;
}

export function formatPriceInput(raw: string): string {
  const cleaned = raw.replace(/,/g, "");
  return cleaned.replace(/\B(?=(\w{3})+(?!\w))/g, ",");
}
