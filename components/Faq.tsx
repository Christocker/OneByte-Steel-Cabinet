"use client";

import { useState } from "react";
import Reveal from "./Reveal";

const faqs = [
  {
    question: "Is pick up available?",
    answer: "Yes. Pick up is available, and delivery is also available.",
  },
  {
    question: "Is delivery free?",
    answer:
      "No. If delivery is via Lalamove, you pay the Lalamove rate. If we deliver, the fee depends on your location.",
  },
  {
    question: "When can I pick up or have my order delivered?",
    answer:
      "Weekdays: 5:30 PM onwards. Weekends: the whole day.",
  },
  {
    question: "Can the cabinet be delivered already assembled?",
    answer:
      "Yes, depending on what the buyer wants. Just let us know your preference.",
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="mx-auto max-w-4xl border-t border-white/10 px-6 py-20 sm:px-8 sm:py-24">
      <Reveal className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-500">
          FAQ
        </p>
        <h2 className="mt-3 text-5xl font-bold text-white sm:text-6xl lg:text-7xl">
          Frequently Asked Questions
        </h2>
      </Reveal>

      <div className="mt-12 space-y-4">
        {faqs.map((f, i) => {
          const open = openIndex === i;
          return (
            <Reveal
              key={f.question}
              className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/80 transition-all duration-300 hover:border-blue-500/40"
              delay={i * 80}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(open ? null : i)}
                aria-expanded={open}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <span className="text-base font-semibold text-white sm:text-lg">
                  {f.question}
                </span>
                <svg
                  className={`h-5 w-5 flex-shrink-0 text-blue-500 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.3 7.3a1 1 0 011.4 0L10 10.6l3.3-3.3a1 1 0 111.4 1.4l-4 4a1 1 0 01-1.4 0l-4-4a1 1 0 010-1.4z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              <div
                className={`grid transition-all duration-500 ease-out ${
                  open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-6 pb-6 leading-relaxed text-zinc-400">
                    {f.answer}
                  </p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
