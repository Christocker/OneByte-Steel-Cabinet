export type CabinetProduct = {
  id: string;
  itemNumber: number;
  displayItemNumber?: number;
  brand: string;
  name: string;
  price: string;
  dimensions: string;
  images: string[];
  preorder?: boolean;
  active?: boolean;
};

export type InventoryProduct = CabinetProduct & {
  stock: number;
};

// NOTE: The static products array has been removed.
// Product catalog is now database-driven via lib/catalog.ts.
// Use getActiveProducts() or getAllProducts() from catalog.ts
// to retrieve products at runtime.
