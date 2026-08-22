export type Availability = "preorder" | "in-stock" | "out-of-stock";

export function getAvailability(preorder: boolean, stock: number): Availability {
  if (preorder) return "preorder";
  return stock > 0 ? "in-stock" : "out-of-stock";
}

export function getAvailabilityLabel(status: Availability): string {
  switch (status) {
    case "preorder":
      return "Pre-Order";
    case "in-stock":
      return "In Stock";
    case "out-of-stock":
      return "Out of Stock";
  }
}

export function getAvailabilityColor(status: Availability): string {
  switch (status) {
    case "preorder":
      return "bg-amber-100 text-amber-800";
    case "in-stock":
      return "bg-emerald-100 text-emerald-800";
    case "out-of-stock":
      return "bg-red-100 text-red-800";
  }
}

export function getAvailabilityDotColor(status: Availability): string {
  switch (status) {
    case "preorder":
      return "bg-amber-600";
    case "in-stock":
      return "bg-emerald-600";
    case "out-of-stock":
      return "bg-red-600";
  }
}
