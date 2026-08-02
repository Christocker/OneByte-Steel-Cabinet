import Image from "next/image";

type ProductCardProps = {
  image: string;
  name: string;
  price: string;
  size: string;
};

export default function ProductCard({
  image,
  name,
  price,
  size,
}: ProductCardProps) {
  return (
    <div className="bg-zinc-900 rounded-3xl overflow-hidden shadow-xl hover:scale-105 transition duration-300">

      <Image
        src={image}
        alt={name}
        width={500}
        height={500}
        className="w-full h-72 object-cover"
      />

      <div className="p-6">

        <h3 className="text-2xl font-bold text-white">
          {name}
        </h3>

        <p className="text-gray-400 mt-2">
          {size}
        </p>

        <p className="text-blue-500 font-bold text-xl mt-3">
          ₱{price}
        </p>

        <button className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition">
          View Details
        </button>

      </div>

    </div>
  );
}