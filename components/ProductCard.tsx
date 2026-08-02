import Image from "next/image";

export type Product = {
  name: string;
  price: string;
  dimensions: string;
  images: [string, string];
};

export default function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/80 shadow-xl shadow-black/40 transition-all duration-500 ease-out hover:-translate-y-2 hover:border-white/20 hover:shadow-2xl hover:shadow-blue-950/40">
      <div className="grid grid-cols-2 gap-2 p-3">
        {product.images.map((src) => (
          <div key={src} className="relative aspect-[3/4] overflow-hidden rounded-2xl">
            <Image
              src={src}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 45vw, (max-width: 1024px) 25vw, 16vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </div>
        ))}
      </div>

      <div className="px-5 pb-6 pt-2">
        <h3 className="text-lg font-bold text-white">{product.name}</h3>
        <div className="mt-2 flex items-baseline justify-between gap-3">
          <p className="text-2xl font-extrabold text-blue-400">₱{product.price}</p>
          <p className="text-xs uppercase tracking-wider text-zinc-500">H × W × D</p>
        </div>
        <p className="mt-1 text-sm font-medium text-zinc-300">{product.dimensions}</p>
      </div>
    </article>
  );
}
