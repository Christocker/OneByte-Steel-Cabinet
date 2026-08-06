function groupDigits(digits: string): string {
  const cleaned = digits.replace(/^0+(?=\d)/, "");
  return (cleaned || "0").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function formatPriceInput(raw: string): string {
  const cleaned = raw.replace(/,/g, "");
  return cleaned.replace(/\B(?=(\w{3})+(?!\w))/g, ",");
}

export function formatPriceDisplay(value: string | number): string {
  const text = typeof value === "number" ? String(value) : value.trim();
  if (text.length === 0) return "";

  const withoutPrefixSymbol = text.replace(/^₱\s?/, "");

  return withoutPrefixSymbol.replace(/\d[\d,.]*[xX]*/g, (token) => {
    const xMatch = token.match(/[xX]+$/);
    const xSuffix = xMatch ? xMatch[0] : "";

    if (xSuffix) {
      const digits = token.slice(0, -xSuffix.length).replace(/[^\d]/g, "");
      return `₱${groupDigits(digits)},${xSuffix}`;
    }

    const dotIndex = token.indexOf(".");
    if (dotIndex !== -1) {
      const intPart = token.slice(0, dotIndex).replace(/[^\d]/g, "");
      const decimalPart = token.slice(dotIndex).replace(/[^\d.]/g, "");
      return decimalPart && decimalPart !== "."
        ? `₱${groupDigits(intPart)}${decimalPart}`
        : `₱${groupDigits(intPart)}`;
    }

    return `₱${groupDigits(token.replace(/[^\d]/g, ""))}`;
  });
}
