export type CabinetProduct = {
  id: string;
  itemNumber: number;
  brand: string;
  name: string;
  price: string;
  dimensions: string;
  images: string[];
  preorder?: boolean;
};

export type InventoryProduct = CabinetProduct & {
  stock: number;
};

export const products: CabinetProduct[] = [
  {
    id: "full-metal-light-gray",
    itemNumber: 1,
    brand: "Steeline",
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
    itemNumber: 2,
    brand: "WorldCraft",
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
    itemNumber: 3,
    brand: "WorldCraft",
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
    itemNumber: 4,
    brand: "WorldCraft",
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
    itemNumber: 5,
    brand: "WorldCraft",
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
    itemNumber: 6,
    brand: "WorldCraft",
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
    itemNumber: 7,
    brand: "WorldCraft",
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
    itemNumber: 8,
    brand: "WorldCraft",
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
    itemNumber: 9,
    brand: "Steeline",
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
    itemNumber: 10,
    brand: "WorldCraft",
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
    itemNumber: 11,
    brand: "WorldCraft",
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
    itemNumber: 12,
    brand: "WorldCraft",
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
    itemNumber: 13,
    brand: "WorldCraft",
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
    itemNumber: 14,
    brand: "WorldCraft",
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
    itemNumber: 15,
    brand: "WorldCraft",
    name: "Wardrobe with Shelves — White",
    price: "7600",
    dimensions: "185 × 90 × 45 cm",
    images: [
      "/images/products/worldcraft-wardrobe-shelves-white-1.png",
      "/images/products/worldcraft-wardrobe-shelves-white-2.png",
    ],
  },
  {
    id: "half-glass-black-woodgrain",
    itemNumber: 16,
    brand: "WorldCraft",
    name: "Half Glass Cabinet — Black Woodgrain",
    price: "6200",
    dimensions: "185 × 90 × 40 cm",
    images: [
      "/images/products/worldcraft-half-glass-black-woodgrain-1.png",
      "/images/products/worldcraft-half-glass-black-woodgrain-2.jpg",
    ],
  },
  {
    id: "wardrobe-hanger-white",
    itemNumber: 17,
    brand: "WorldCraft",
    name: "Wardrobe with Hanger — White",
    price: "7000",
    dimensions: "185 × 90 × 45 cm",
    images: [
      "/images/products/worldcraft-wardrobe-hanger-white-1.png",
      "/images/products/worldcraft-wardrobe-hanger-white-2.png",
    ],
  },
  {
    id: "full-glass-gray-white",
    itemNumber: 18,
    brand: "WorldCraft",
    name: "Full Glass Cabinet — Gray & White",
    price: "6000",
    dimensions: "185 × 90 × 40 cm",
    images: [
      "/images/products/worldcraft-full-glass-gray-white-1.png",
      "/images/products/worldcraft-full-glass-gray-white-2.jpg",
    ],
  },
  {
    id: "wardrobe-hanger-black-woodgrain",
    itemNumber: 19,
    brand: "WorldCraft",
    name: "Wardrobe with Hanger — Black Woodgrain",
    price: "6600",
    dimensions: "185 × 90 × 45 cm",
    images: [
      "/images/products/worldcraft-wardrobe-hanger-black-woodgrain-1.png",
      "/images/products/worldcraft-wardrobe-hanger-black-woodgrain-2.png",
    ],
  },
  {
    id: "lateral-filing-4-drawers",
    itemNumber: 20,
    brand: "OneByte",
    name: "Lateral Filing Cabinet 4-Drawers",
    price: "8100",
    dimensions: "133.1 × 90 × 45 cm",
    images: [
      "/images/products/lateral-filing-4-drawers-1.jpg",
    ],
    preorder: true,
  },
  {
    id: "lateral-filing-3-drawers",
    itemNumber: 21,
    brand: "OneByte",
    name: "Lateral Filing Cabinet 3-Drawers",
    price: "6700",
    dimensions: "103.1 × 90 × 45 cm",
    images: [
      "/images/products/lateral-filing-3-drawers-1.jpg",
    ],
    preorder: true,
  },
  {
    id: "steeline-full-glass-light-gray",
    itemNumber: 22,
    brand: "Steeline",
    name: "Full Glass Cabinet — Light Gray",
    price: "5800",
    dimensions: "180 × 80 × 40 cm",
    images: [
      "/images/products/steeline-full-glass-light-gray-1.png",
      "/images/products/steeline-full-glass-light-gray-2.jpg",
    ],
  },
  {
    id: "worldcraft-wardrobe-shelves-print-pink",
    itemNumber: 23,
    brand: "WorldCraft",
    name: "Wardrobe with Shelves — Print Pink",
    price: "6800",
    dimensions: "185 × 90 × 45 cm",
    images: [
      "/images/products/worldcraft-wardrobe-shelves-print-pink-1.jpg",
      "/images/products/worldcraft-wardrobe-shelves-print-pink-2.jpg",
      "/images/products/worldcraft-wardrobe-shelves-print-pink-3.jpg",
    ],
  },
];
