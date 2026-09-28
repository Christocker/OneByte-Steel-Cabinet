export function getSiteUrl(): string {
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "https://onebyte-steel-cabinet.vercel.app";
}

export function getSiteHost(): string {
  return getSiteUrl().replace(/^https?:\/\//, "");
}

export const SITE_CONTACT = {
  phone: "+639183811094",
  phoneDisplay: "+63 918 381 1094",
  whatsappNumber: "639183811094",
  facebookPageId: "61572768444647",
  facebookUrl: "https://www.facebook.com/profile.php?id=61572768444647",
  messengerUrl: "https://m.me/61572768444647",
  viberUrl: "viber://chat?number=%2B639183811094",
  city: "Dasmariñas, Cavite",
  hoursSummary: "Weekdays 5:30 PM onwards · Weekends all day",
  responseNote: "We usually reply within 1 hour during store hours.",
} as const;

type InquiryProduct = {
  itemNumber: number;
  displayItemNumber?: number;
  name: string;
  price?: string;
};

export function buildInquiryMessage(product: InquiryProduct): string {
  const number = product.displayItemNumber ?? product.itemNumber;
  return `Hi OneByte! I'm interested in Item #${number} — ${product.name}. Is it available?`;
}

export function whatsappInquiryUrl(product: InquiryProduct): string {
  return `https://wa.me/${SITE_CONTACT.whatsappNumber}?text=${encodeURIComponent(
    buildInquiryMessage(product)
  )}`;
}
