import ProductCard from "./ProductCard";

export default function Products() {
  return (
    <section className="max-w-7xl mx-auto px-8 py-24">

      <h2 className="text-5xl font-bold text-white text-center">
        Featured Products
      </h2>

      <p className="text-gray-400 text-center mt-4 mb-16">
        Our best-selling steel cabinets.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">

        <ProductCard
          image="/images/products/1.jpeg"
          name="Sliding Floral Cabinet"
          price="6800"
          size="185 × 90 × 50 cm"
        />

        <ProductCard
          image="/images/products/2.jpeg"
          name="Full Metal Cabinet"
          price="5800"
          size="180 × 80 × 40 cm"
        />

        <ProductCard
          image="/images/products/3.jpeg"
          name="Glass Display Cabinet"
          price="6000"
          size="185 × 90 × 40 cm"
        />

      </div>

    </section>
  );
}