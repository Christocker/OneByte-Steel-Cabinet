import Image from "next/image";
import Reveal from "./Reveal";

export default function Hero() {
  return (
    <section className="relative flex min-h-svh items-center overflow-hidden">
      <div className="pointer-events-none absolute -left-40 -top-40 h-[320px] w-[320px] animate-float sm:h-[480px] sm:w-[480px]">
        <div className="h-full w-full rounded-full bg-navy/20 blur-[100px]" />
      </div>
      <div
        className="pointer-events-none absolute -bottom-40 -right-40 h-[340px] w-[340px] animate-float sm:h-[520px] sm:w-[520px]"
        style={{ animationDelay: "2s" }}
      >
        <div className="h-full w-full rounded-full bg-navy-light/15 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-14 px-6 py-20 sm:px-8 sm:py-24 lg:grid-cols-2">
        <Reveal className="text-center lg:text-left">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-beige-deep bg-beige-soft px-4 py-2 text-sm font-medium text-navy shadow-lg shadow-navy/15">
              <span className="h-2 w-2 rounded-full bg-navy animate-pulse" />
              OneByte Steel Cabinets
            </span>

            <h1 className="mt-6 text-4xl font-bold leading-[1.15] text-navy sm:text-6xl sm:leading-[1.1]">
              Premium Steel Cabinets{" "}
              <span className="bg-gradient-to-r from-navy to-navy-light bg-clip-text text-transparent">
                Built to Last.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg text-navy/70 sm:text-xl lg:mx-0">
              Your trusted dealer for secure, durable, and modern steel cabinets —
              for homes, offices, schools, warehouses, and businesses.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <a
                href="#products"
                className="w-full rounded-2xl bg-navy px-8 py-4 text-center font-semibold text-white transition-all duration-300 ease-out hover:bg-navy-light hover:shadow-xl hover:shadow-navy/30 active:scale-95 sm:w-auto"
              >
                Browse Products
              </a>
              <a
                href="#contact"
                className="w-full rounded-2xl border border-navy/25 bg-beige-soft px-8 py-4 text-center font-semibold text-navy backdrop-blur transition-all duration-300 hover:bg-navy hover:text-white active:scale-95 sm:w-auto"
              >
                Request Quote
              </a>
            </div>
          </div>
        </Reveal>

        <Reveal delay={150}>
          <div className="animate-fade-up">
            <div className="relative mx-auto max-w-md animate-float">
              <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-tr from-navy/25 to-navy-light/15 blur-2xl" />
              <Image
                src="/images/hero/hero.png"
                alt="OneByte Steel Cabinet"
                width={1254}
                height={1254}
                sizes="(max-width: 768px) 90vw, 500px"
                className="relative h-auto w-full rounded-[2rem] border border-beige-deep shadow-2xl shadow-navy/20"
                priority
              />
              <div className="absolute -bottom-5 left-6 flex items-center gap-3 rounded-2xl border border-beige-deep bg-beige-soft/95 px-5 py-3 shadow-lg shadow-navy/10">
                <svg className="h-6 w-6 text-navy" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M12 2l7 3v6c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V5l7-3zm-1 13l5-5-1.4-1.4L11 12.2l-2-2L7.6 11.6 11 15z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-navy">Built to last</p>
                  <p className="text-xs text-navy/60">Heavy-gauge steel</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
