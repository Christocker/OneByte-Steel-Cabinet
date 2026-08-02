import Image from "next/image";
import Reveal from "./Reveal";

export default function Hero() {
  return (
    <section className="relative flex min-h-svh items-center overflow-hidden">
      <div className="pointer-events-none absolute -left-40 -top-40 h-[320px] w-[320px] animate-float sm:h-[480px] sm:w-[480px]">
        <div className="h-full w-full rounded-full bg-blue-600/30 blur-[100px]" />
      </div>
      <div
        className="pointer-events-none absolute -bottom-40 -right-40 h-[340px] w-[340px] animate-float sm:h-[520px] sm:w-[520px]"
        style={{ animationDelay: "2s" }}
      >
        <div className="h-full w-full rounded-full bg-indigo-600/20 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-14 px-6 py-20 sm:px-8 sm:py-24 lg:grid-cols-2">
        <Reveal className="text-center lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-blue-400 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            OneByte Steel Cabinets
          </span>

          <h1 className="mt-6 text-4xl font-bold leading-[1.15] text-white sm:text-6xl sm:leading-[1.1]">
            Premium Steel Cabinets{" "}
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Built to Last.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-400 sm:text-xl lg:mx-0">
            Your trusted dealer for secure, durable, and modern steel cabinets —
            for homes, offices, schools, warehouses, and businesses.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
            <a
              href="#products"
              className="w-full rounded-2xl bg-blue-600 px-8 py-4 text-center font-semibold text-white transition-all duration-300 ease-out hover:bg-blue-500 hover:shadow-xl hover:shadow-blue-600/40 active:scale-95 sm:w-auto"
            >
              Browse Products
            </a>
            <a
              href="#contact"
              className="w-full rounded-2xl border border-white/15 bg-white/5 px-8 py-4 text-center font-semibold text-white backdrop-blur transition-all duration-300 hover:bg-white hover:text-black active:scale-95 sm:w-auto"
            >
              Request Quote
            </a>
          </div>
        </Reveal>

        <Reveal delay={150}>
          <div className="relative mx-auto max-w-md animate-float">
            <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-tr from-blue-600/40 to-indigo-500/20 blur-2xl" />
            <Image
              src="/images/hero/hero-cabinet.jpeg"
              alt="OneByte Steel Cabinet"
              width={500}
              height={650}
              sizes="(max-width: 768px) 90vw, 500px"
              className="relative h-auto w-full rounded-[2rem] border border-white/10 shadow-2xl shadow-black/50"
              priority
            />
            <div className="absolute -bottom-5 left-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-5 py-3 backdrop-blur-xl">
              <svg className="h-6 w-6 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M12 2l7 3v6c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V5l7-3zm-1 13l5-5-1.4-1.4L11 12.2l-2-2L7.6 11.6 11 15z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="text-sm font-semibold text-white">Built to last</p>
                <p className="text-xs text-zinc-300">Heavy-gauge steel</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
