export type DimensionUnit = "cm" | "in";

export type ParsedDimensions = {
  h: string;
  w: string;
  d: string;
  unit: DimensionUnit;
};

// Parses "180 × 80 × 40 cm" (also accepts "x" and an optional unit).
export function parseDimensions(raw: string): ParsedDimensions {
  const match = raw.match(
    /^([\d.]*)\s*[×x]\s*([\d.]*)\s*[×x]\s*([\d.]*)\s*(cm|in)?$/i
  );
  if (match) {
    return {
      h: match[1],
      w: match[2],
      d: match[3],
      unit: (match[4]?.toLowerCase() as DimensionUnit) || "cm",
    };
  }
  return { h: "", w: "", d: "", unit: "cm" };
}

export function buildDimensions(
  h: string,
  w: string,
  d: string,
  unit: DimensionUnit
): string {
  if (!h || !w || !d) return "";
  return `${h} × ${w} × ${d} ${unit}`;
}
