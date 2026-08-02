import Image from "next/image";

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto w-full px-8">

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* LEFT */}

          <div>

            <p className="text-blue-500 uppercase tracking-[0.3em] font-semibold mb-4">
              OneByte Steel Cabinets
            </p>

            <h1 className="text-6xl font-bold leading-tight mb-6">
              Premium Steel Cabinets
              <br />
              Built to Last.
            </h1>

            <p className="text-slate-400 text-xl mb-10">
              Secure, durable, and modern steel cabinets for
              homes, offices, schools, warehouses, and businesses.
            </p>

            <div className="flex gap-5">

              <button className="bg-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition">
                Browse Products
              </button>

              <button className="border border-white px-8 py-4 rounded-lg hover:bg-white hover:text-black transition">
                Request Quote
              </button>

            </div>

          </div>

          {/* RIGHT */}

          <div className="flex justify-center">

           <div className="flex justify-center">

  <Image
    src="/images/hero/hero-cabinet.jpeg"
    alt="OneByte Steel Cabinet"
    width={500}
    height={650}
    className="rounded-3xl shadow-2xl transition duration-300 hover:scale-105"
    priority
  />

</div>

          </div>

        </div>

      </div>
    </section>
  );
}