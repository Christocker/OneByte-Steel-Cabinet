"use client";

import { ChangeEvent, useRef } from "react";
import { formatPriceInput } from "@/lib/format";

type PriceInputProps = {
  id: string;
  value: string;
  onChange: (rawDigits: string) => void;
  invalid?: boolean;
  describedBy?: string;
};

export default function PriceInput({ id, value, onChange, invalid, describedBy }: PriceInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const el = event.target;
    const raw = el.value;
    const caret = el.selectionStart ?? raw.length;
    const digitsBeforeCaret = raw.slice(0, caret).replace(/\D/g, "").length;
    const nextValue = formatPriceInput(raw);

    onChange(nextValue);

    if (el === document.activeElement) {
      requestAnimationFrame(() => {
        const formatted = formatPriceInput(nextValue);
        let pos = 0;
        let seen = 0;
        while (pos < formatted.length && seen < digitsBeforeCaret) {
          if (/\d/.test(formatted[pos])) seen += 1;
          pos += 1;
        }
        while (pos < formatted.length && !/\d/.test(formatted[pos])) pos += 1;
        el.setSelectionRange(pos, pos);
      });
    }
  }

  return (
    <input
      ref={inputRef}
      id={id}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      value={formatPriceInput(value)}
      onChange={handleChange}
      aria-invalid={invalid}
      aria-describedby={describedBy}
      className="mt-2 h-12 w-full rounded-xl border-2 border-beige-deep bg-beige px-4 text-center text-lg font-bold text-navy outline-none transition-colors focus:border-navy aria-[invalid=true]:border-red-500"
    />
  );
}
