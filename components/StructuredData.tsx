import { FAQS } from "@/lib/faq";
import { getSiteUrl, SITE_CONTACT } from "@/lib/site";

export default function StructuredData() {
  const siteUrl = getSiteUrl();

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": `${siteUrl}/#business`,
        name: "OneByte Steel Cabinets",
        url: siteUrl,
        image: `${siteUrl}/images/hero/hero.png`,
        logo: `${siteUrl}/images/logo/onebyte-logo.jpg`,
        telephone: SITE_CONTACT.phone,
        priceRange: "₱₱",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Dasmariñas",
          addressRegion: "Cavite",
          addressCountry: "PH",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 14.3389871,
          longitude: 120.9322848,
        },
        sameAs: [SITE_CONTACT.facebookUrl],
      },
      {
        "@type": "FAQPage",
        "@id": `${siteUrl}/#faq`,
        mainEntity: FAQS.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
