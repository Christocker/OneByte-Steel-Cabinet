import type { InventoryProduct } from "./products";
import { formatPriceDisplay } from "./format";
import { getAvailability, getAvailabilityLabel } from "./availability";

// Browser-only: renders the whole catalog into a single JPEG using <canvas>.
// Images are fetched (local directly, remote via /api/image-proxy) so the canvas
// is never tainted and toBlob works.

const WIDTH = 1200;
const PADDING = 28;
const GAP = 24;
const COLS = 3;
const HEADER = 176;
const FOOTER = 96;

const COLORS = {
  bg: "#f4eddd",
  card: "#fffdf7",
  border: "#c7b295",
  navy: "#1f3a5f",
  navyLight: "#3a5e8c",
  muted: "rgba(31,58,95,0.65)",
};

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth || current === "") {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
      if (lines.length === maxLines) break;
    }
  }
  if (lines.length < maxLines && current) lines.push(current);
  return lines.slice(0, maxLines);
}

// Scale to fit entirely inside the slot and center it, so the whole cabinet is
// always visible (never cropped top/bottom).
function drawContain(
  ctx: CanvasRenderingContext2D,
  image: ImageBitmap,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const scale = Math.min(w / image.width, h / image.height);
  const dw = image.width * scale;
  const dh = image.height * scale;
  ctx.drawImage(image, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

async function loadImage(url: string): Promise<ImageBitmap | null> {
  try {
    const target = url.startsWith("/")
      ? url
      : `/api/image-proxy?url=${encodeURIComponent(url)}`;
    const res = await fetch(target, { credentials: "same-origin" });
    if (!res.ok) return null;
    const blob = await res.blob();
    return await createImageBitmap(blob);
  } catch {
    return null;
  }
}

function availabilityColors(preorder: boolean, stock: number) {
  const status = getAvailability(preorder, stock);
  switch (status) {
    case "preorder":
      return { label: getAvailabilityLabel(status), bg: "#fef3c7", text: "#92400e", dot: "#d97706" };
    case "in-stock":
      return { label: getAvailabilityLabel(status), bg: "#d1fae5", text: "#065f46", dot: "#059669" };
    default:
      return { label: getAvailabilityLabel(status), bg: "#fee2e2", text: "#991b1b", dot: "#dc2626" };
  }
}

export async function renderCatalogJpeg(
  products: InventoryProduct[],
  contact: string
): Promise<Blob> {
  const cellW = Math.round((WIDTH - PADDING * 2 - GAP * (COLS - 1)) / COLS);
  const imageH = Math.round(cellW * 1.0);
  // Tall enough for a two-line product name plus price/dimensions/availability.
  const textH = 248;
  const cellH = imageH + textH;
  const rows = Math.max(1, Math.ceil(products.length / COLS));
  const height = HEADER + rows * cellH + (rows - 1) * GAP + FOOTER + PADDING;
  // Browsers cap canvas dimensions; fail clearly rather than silently.
  if (height > 30000) {
    throw new Error("Too many products to render in a single image.");
  }

  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");

  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, WIDTH, height);

  // Header
  ctx.fillStyle = COLORS.navy;
  ctx.font = "800 54px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("OneByte Steel Cabinets", PADDING, 78);
  ctx.fillStyle = COLORS.muted;
  ctx.font = "500 24px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
  ctx.fillText(contact, PADDING, 118);
  ctx.fillStyle = COLORS.border;
  ctx.fillRect(PADDING, 140, WIDTH - PADDING * 2, 2);

  const bitmaps = await Promise.all(
    products.map((product) =>
      Promise.all(product.images.slice(0, 2).map((src) => loadImage(src)))
    )
  );

  products.forEach((product, index) => {
    const col = index % COLS;
    const row = Math.floor(index / COLS);
    const x = PADDING + col * (cellW + GAP);
    const y = HEADER + row * (cellH + GAP);

    roundRectPath(ctx, x, y, cellW, cellH, 20);
    ctx.fillStyle = COLORS.card;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = COLORS.border;
    ctx.stroke();

    // Photos: up to two side by side (like the product card), each contained so
    // the whole cabinet shows, on a soft beige letterbox with rounded corners.
    const photos = bitmaps[index];
    const innerPad = 12;
    const slotGap = 10;
    const slotH = imageH - innerPad * 2;
    ctx.fillStyle = "#efe7d6";
    ctx.fillRect(x, y, cellW, imageH);

    const drawSlot = (image: ImageBitmap | null, sx: number, sw: number) => {
      ctx.save();
      roundRectPath(ctx, sx, y + innerPad, sw, slotH, 14);
      ctx.clip();
      ctx.fillStyle = "#efe7d6";
      ctx.fillRect(sx, y + innerPad, sw, slotH);
      if (image) {
        drawContain(ctx, image, sx, y + innerPad, sw, slotH);
      } else {
        ctx.fillStyle = "rgba(31,58,95,0.4)";
        ctx.font = "600 20px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("No image", sx + sw / 2, y + innerPad + slotH / 2);
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
      }
      ctx.restore();
    };

    if (photos.length >= 2) {
      const sw = (cellW - innerPad * 2 - slotGap) / 2;
      drawSlot(photos[0], x + innerPad, sw);
      drawSlot(photos[1], x + innerPad + sw + slotGap, sw);
    } else {
      drawSlot(photos[0] ?? null, x + innerPad, cellW - innerPad * 2);
    }

    let ty = y + imageH + 40;

    // Item # pill
    const itemNumber = product.displayItemNumber ?? product.itemNumber;
    const pillText = `ITEM #${itemNumber}`;
    ctx.font = "800 18px system-ui, sans-serif";
    const pillW = ctx.measureText(pillText).width + 28;
    roundRectPath(ctx, x + 18, ty - 24, pillW, 34, 17);
    ctx.fillStyle = COLORS.navy;
    ctx.fill();
    ctx.fillStyle = "#fffdf7";
    ctx.fillText(pillText, x + 18 + 14, ty);

    ty += 34;

    // Brand
    ctx.fillStyle = COLORS.muted;
    ctx.font = "700 16px system-ui, sans-serif";
    ctx.fillText(product.brand.toUpperCase(), x + 18, ty);

    // Name (up to 2 lines)
    ty += 30;
    ctx.fillStyle = COLORS.navy;
    ctx.font = "700 24px system-ui, sans-serif";
    const nameLines = wrapText(ctx, product.name, cellW - 36, 2);
    for (const line of nameLines) {
      ctx.fillText(line, x + 18, ty);
      ty += 30;
    }

    // Price
    ty += 6;
    ctx.fillStyle = COLORS.navyLight;
    ctx.font = "800 34px system-ui, sans-serif";
    ctx.fillText(formatPriceDisplay(product.price), x + 18, ty);

    // Dimensions
    ty += 30;
    ctx.fillStyle = "rgba(31,58,95,0.8)";
    ctx.font = "600 20px system-ui, sans-serif";
    ctx.fillText(product.dimensions, x + 18, ty);

    // Availability (status only — no numeric stock count in the export)
    ty += 22;
    const colors = availabilityColors(product.preorder ?? false, product.stock);
    const availText = colors.label;
    ctx.font = "800 18px system-ui, sans-serif";
    const availW = ctx.measureText(availText).width + 46;
    roundRectPath(ctx, x + 18, ty - 20, Math.min(availW, cellW - 36), 32, 16);
    ctx.fillStyle = colors.bg;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 18 + 16, ty - 4, 6, 0, Math.PI * 2);
    ctx.fillStyle = colors.dot;
    ctx.fill();
    ctx.fillStyle = colors.text;
    ctx.fillText(availText, x + 18 + 30, ty);
  });

  // Footer
  const fy = height - FOOTER + 20;
  ctx.fillStyle = COLORS.border;
  ctx.fillRect(PADDING, fy - 24, WIDTH - PADDING * 2, 2);
  ctx.fillStyle = COLORS.muted;
  ctx.font = "500 20px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(
    "Prices may change without prior notice. Message us to order.",
    WIDTH / 2,
    fy + 12
  );
  ctx.textAlign = "left";

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not encode JPEG."))),
      "image/jpeg",
      0.92
    );
  });
}
