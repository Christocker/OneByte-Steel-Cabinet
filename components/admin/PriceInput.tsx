"use client";

import { ChangeEvent, useRef } from "react";
import { formatPriceInput } from "@/lib/format";

type PriceInputProps = {
  id: string;
  value: string;
  onChange: (rawValue: string) => void;
  invalid?: boolean;
  describedBy?: string;
};

function shouldMask(text: string): boolean {
  return /^\d/.test(text);
}

export default function PriceInput({ id, value, onChange, invalid, describedBy }: PriceInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const masked = shouldMask(value);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const el = event.target;
    const display = el.value;

    if (shouldMask(display)) {
      const caret = el.selectionStart ?? display.length;
      const charsBeforeCaret = display.slice(0, caret).replace(/,/g, "").length;
      const rawValue = display.replace(/,/g, "");
      const formatted = formatPriceInput(rawValue);

      onChange(rawValue);

      if (el === document.activeElement) {
        requestAnimationFrame(() => {
          let pos = 0;
          let seen = 0;
          while (pos < formatted.length && seen < charsBeforeCaret) {
            if (formatted[pos] !== ",") seen += 1;
            pos += 1;
          }
          while (pos < formatted.length && formatted[pos] === ",") pos += 1;
          el.setSelectionRange(pos, pos);
        });
      }
    } else {
      onChange(display);
    }
  }

  const displayed = masked ? formatPriceInput(value) : value;

  return (
    <input
      ref={inputRef}
      id={id}
      type="text"
      value={displayed}
      onChange={handleChange}
      aria-invalid={invalid}
      aria-describedby={describedBy}
      className="mt-2 h-12 w-full rounded-xl border-2 border-beige-deep bg-beige px-4 text-center text-lg font-bold text-navy outline-none transition-colors focus:border-navy aria-[invalid=true]:border-red-500"
    />
  );
}
