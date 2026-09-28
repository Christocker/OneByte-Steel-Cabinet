import { SITE_CONTACT } from "@/lib/site";

export default function StickyMobileContact() {
  return (
    <div className="sticky-contact fixed inset-x-0 bottom-0 z-40 border-t-2 border-beige-deep bg-beige-soft/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-lg sm:hidden">
      <div className="grid grid-cols-3 gap-2 text-sm font-semibold">
        <a
          href={`tel:${SITE_CONTACT.phone}`}
          className="rounded-xl bg-navy px-3 py-3 text-center text-white transition-colors active:scale-95"
        >
          Call
        </a>
        <a
          href={`https://wa.me/${SITE_CONTACT.whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl bg-[#128C7E] px-3 py-3 text-center text-white transition-colors active:scale-95"
        >
          WhatsApp
        </a>
        <a
          href={SITE_CONTACT.messengerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border-2 border-navy/25 bg-beige px-3 py-3 text-center text-navy transition-colors active:scale-95"
        >
          Messenger
        </a>
      </div>
    </div>
  );
}
