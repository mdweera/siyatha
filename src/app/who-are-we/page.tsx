import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Clock3, MapPin, PhoneCall } from "lucide-react";

export const metadata = {
  title: "Who we are",
  description: "Siyatha prints photos, sells packaging for online sellers, and stocks craft materials in Kirimatiya, Batapola.",
  alternates: { canonical: "/who-are-we", languages: { en: "/who-are-we?lang=en", si: "/who-are-we?lang=si" } },
};

export default function WhoAreWePage() {
  const values = [
    {
      title: "Fair Pricing",
      text: "සෑමවිටම හොඳම මිල ඔබට. Prices stay on the page, and photo print prices can be checked before you upload.",
    },
    {
      title: "Trusted Support",
      text: "Phone and WhatsApp support stays with you after the purchase.",
    },
    {
      title: "Curated Products",
      text: "Everyday use products and seller essentials carefully selected for local needs.",
    },
  ];

  return (
    <div className="relative flex-grow overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="relative mx-auto w-full max-w-7xl space-y-8">
        <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#DE2684] via-[#F2B400] to-[#F9E094] px-6 py-8 text-[#2b1636] sm:px-9 sm:py-10">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-[#2b1636]/20 bg-white/50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]">
                <BadgeCheck size={14} /> About Siyatha Online
              </p>
              <h1 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                Who we are
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#2b1636] sm:text-base">
                Siyatha Online prints photos you upload, packs parcels for people who sell online, and stocks craft materials
                for sewing, paper, and glue. We work from Kirimatiya, Batapola, and send orders across Sri Lanka.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/shop"
                  className="btn-primary no-underline"
                >
                  Shop Now <ArrowRight size={16} />
                </Link>
                <a
                  href="https://www.facebook.com/profile.php?id=61587396941428"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary no-underline"
                >
                  Facebook Page
                </a>
              </div>
            </div>

            <div className="surface-card rounded-3xl p-5 text-slate-900">
              <div className="flex items-center gap-3">
                <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-cyan-100 bg-white">
                  <Image src="/siyatha-logo.jpg" alt="Siyatha logo" fill className="object-cover" sizes="56px" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">Siyatha Online</p>
                  <h2 className="font-display text-xl font-bold text-slate-900">සෑමවිටම හොඳම මිල ඔබට</h2>
                </div>
              </div>

              <ul className="mt-5 space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-3">
                  <PhoneCall size={17} className="mt-0.5 text-cyan-700" />
                  <div>
                    <p className="font-semibold text-slate-900">Phone / WhatsApp</p>
                    <a href="tel:+94766609143" className="hover:text-cyan-700">+94 76 660 9143</a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin size={17} className="mt-0.5 text-cyan-700" />
                  <div>
                    <p className="font-semibold text-slate-900">Location</p>
                    <p>Kirimatiya, Batapola, Ambalangoda.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Clock3 size={17} className="mt-0.5 text-cyan-700" />
                  <div>
                    <p className="font-semibold text-slate-900">Working Hours</p>
                    <p>Mon - Sat: 9.00 AM - 7.00 PM</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((item) => (
            <article key={item.title} className="surface-card rounded-3xl p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-cyan-700">Value</p>
              <h3 className="mt-2 font-display text-xl font-bold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
            </article>
          ))}
        </section>

        <section className="surface-card rounded-[2rem] p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">Where We Are</p>
              <h3 className="mt-2 font-display text-2xl font-bold text-slate-900">Visit or Contact Us Anytime</h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Based in Kirimatiya, Batapola, Ambalangoda, Siyatha Online serves customers across Sri Lanka with fast
                delivery and responsive support.
              </p>
              <a
                href="https://maps.google.com/?q=Kirimatiya%2C+Batapola%2C+Ambalangoda"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 font-semibold text-cyan-700 hover:text-cyan-800"
              >
                Open location in Google Maps <ArrowRight size={16} />
              </a>
            </div>

            <div className="rounded-2xl border border-cyan-100 bg-cyan-50 px-5 py-4 text-sm text-cyan-900">
              <p className="font-semibold">Need quick help?</p>
              <p className="mt-1">Call or message us and we will guide you to the right product faster.</p>
              <a href="tel:+94766609143" className="mt-3 inline-block font-bold text-cyan-800 hover:text-cyan-900">
                +94 76 660 9143
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
