"use client";

import Image from "next/image";
import { useState } from "react";

const links = [
  { label: "Home", href: "#" },
  { label: "Products", href: "#products" },
  { label: "Order", href: "#how-to-order" },
  { label: "About", href: "#about" },
  { label: "Gallery", href: "#gallery" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-white/10 bg-zinc-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 sm:px-8">
        <a href="#" onClick={closeMenu} className="flex items-center gap-3">
          <Image
            src="/images/logo/onebyte-logo.jpg"
            alt="OneByte Steel Cabinets logo"
            width={48}
            height={48}
            className="h-10 w-10 rounded-xl shadow-lg shadow-black/40 sm:h-12 sm:w-12"
          />
          <span className="text-lg font-bold text-white sm:text-xl">
            OneByte <span className="text-blue-500">Steel</span> Cabinets
          </span>
        </a>

        <div className="hidden items-center gap-6 lg:flex">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="relative whitespace-nowrap text-sm font-medium text-zinc-300 transition-colors duration-300 hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:rounded-full after:bg-blue-500 after:transition-all after:duration-300 hover:after:w-full"
            >
              {l.label}
            </a>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-200 transition-colors duration-300 hover:bg-white/10 hover:text-white active:scale-95 lg:hidden"
        >
          <svg
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
          >
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div
          id="mobile-menu"
          className="animate-menu-drop border-t border-white/10 bg-zinc-950/95 px-6 pb-6 pt-2 backdrop-blur-xl lg:hidden"
        >
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={closeMenu}
              className="block rounded-xl px-4 py-3.5 text-base font-medium text-zinc-300 transition-colors duration-200 hover:bg-white/5 hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
