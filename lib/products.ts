export type CabinetProduct = {
  id: string;
  name: string;
  price: string;
  dimensions: string;
  images: [string, string];
};

export type InventoryProduct = CabinetProduct & {
  stock: number;
};

export const products: CabinetProduct[] = [
  {
    id: "full-metal-light-gray",
    name: "Full Metal Cabinet — Light Gray",
    price: "5800",
    dimensions: "180 × 80 × 40 cm",
    images: [
      "/images/products/steeline-full-metal-light-gray-1.png",
      "/images/products/steeline-full-metal-light-gray-2.png",
    ],
  },
  {
    id: "full-glass-sliding-gray-white",
    name: "Full Glass Sliding Cabinet — Gray & White",
    price: "7200",
    dimensions: "185 × 90 × 40 cm",
    images: [
      "/images/products/worldcraft-full-glass-sliding-gray-white-1.jpg",
      "/images/products/worldcraft-full-glass-sliding-gray-white-2.png",
    ],
  },
  {
    id: "full-glass-sliding-white",
    name: "Full Glass Sliding Cabinet — White",
    price: "7500",
    dimensions: "185 × 90 × 40 cm",
    images: [
      "/images/products/worldcraft-full-glass-sliding-white-1.png",
      "/images/products/worldcraft-full-glass-sliding-white-2.jpg",
    ],
  },
  {
    id: "full-glass-white",
    name: "Full Glass Cabinet — White",
    price: "7300",
    dimensions: "185 × 90 × 40 cm",
    images: [
      "/images/products/worldcraft-full-glass-white-1.png",
      "/images/products/worldcraft-full-glass-white-2.jpg",
    ],
  },
  {
    id: "full-metal-gray-white",
    name: "Full Metal Cabinet — Gray & White",
    price: "6000",
    dimensions: "185 × 85 × 40 cm",
    images: [
      "/images/products/worldcraft-full-metal-gray-white-1.png",
      "/images/products/worldcraft-full-metal-gray-white-2.jpg",
    ],
  },
  {
    id: "half-glass-white",
    name: "Half Glass Cabinet — White",
    price: "6800",
    dimensions: "185 × 90 × 40 cm",
    images: [
      "/images/products/worldcraft-half-glass-white-1.png",
      "/images/products/worldcraft-half-glass-white-2.jpg",
    ],
  },
  {
    id: "wardrobe-brown-beige",
    name: "Wardrobe Cabinet — Brown & Beige",
    price: "7500",
    dimensions: "185 × 90 × 45 cm",
    images: [
      "/images/products/worldcraft-wardrobe-brown-beige-1.png",
      "/images/products/worldcraft-wardrobe-brown-beige-2.png",
    ],
  },
  {
    id: "wardrobe-shelves-woodgrain",
    name: "Wardrobe with Shelves — Woodgrain",
    price: "7200",
    dimensions: "185 × 90 × 45 cm",
    images: [
      "/images/products/worldcraft-wardrobe-shelves-woodgrain-1.png",
      "/images/products/worldcraft-wardrobe-shelves-woodgrain-2.png",
    ],
  },
  {
    id: "half-glass-light-gray",
    name: "Half Glass Cabinet — Light Gray",
    price: "5800",
    dimensions: "180 × 80 × 40 cm",
    images: [
      "/images/products/steeline-half-glass-light-gray-1.png",
      "/images/products/steeline-half-glass-light-gray-2.jpg",
    ],
  },
  {
    id: "full-glass-coffee-beige",
    name: "Full Glass Cabinet — Coffee Beige",
    price: "7300",
    dimensions: "185 × 90 × 40 cm",
    images: [
      "/images/products/worldcraft-full-glass-coffee-beige-1.png",
      "/images/products/worldcraft-full-glass-coffee-beige-2.jpg",
    ],
  },
  {
    id: "full-metal-white",
    name: "Full Metal Cabinet — White",
    price: "6800",
    dimensions: "185 × 85 × 40 cm",
    images: [
      "/images/products/worldcraft-full-metal-white-1.png",
      "/images/products/worldcraft-full-metal-white-2.png",
    ],
  },
  {
    id: "half-glass-coffee-beige",
    name: "Half Glass Cabinet — Coffee Beige",
    price: "6800",
    dimensions: "185 × 90 × 40 cm",
    images: [
      "/images/products/worldcraft-half-glass-coffee-beige-1.png",
      "/images/products/worldcraft-half-glass-coffee-beige-2.jpg",
    ],
  },
  {
    id: "multi-purpose-wardrobe",
    name: "Multi-Purpose Wardrobe",
    price: "7800",
    dimensions: "180 × 80 × 40 cm",
    images: [
      "/images/products/worldcraft-multi-purpose-wardrobe-1.png",
      "/images/products/worldcraft-multi-purpose-wardrobe-2.png",
    ],
  },
  {
    id: "wardrobe-shelves-print-gray",
    name: "Wardrobe with Shelves — Print Gray",
    price: "6800",
    dimensions: "185 × 90 × 45 cm",
    images: [
      "/images/products/worldcraft-wardrobe-shelves-print-gray-1.png",
      "/images/products/worldcraft-wardrobe-shelves-print-gray-2.jpg",
    ],
  },
  {
    id: "wardrobe-shelves-white",
    name: "Wardrobe with Shelves — White",
    price: "7600",
    dimensions: "185 × 90 × 45 cm",
    images: [
      "/images/products/worldcraft-wardrobe-shelves-white-1.png",
      "/images/products/worldcraft-wardrobe-shelves-white-2.png",
    ],
  },
];
