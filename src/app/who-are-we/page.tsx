import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Clock3, MapPin, PhoneCall } from "lucide-react";

export const metadata = {
  title: "Who Are We | Siyatha Online",
  description: "Siyatha Online prints photos, packs parcels for online sellers, and stocks craft materials from Kirimatiya, Batapola, Ambalangoda.",
};

export default function WhoAreWePage() {
  const values = [
    {
      title: "Fair Pricing",
      text: "සෑමවිටම හොඳම මිල ඔබට. We keep pricing transparent and competitive.",
    },
    {
      title: "Trusted Support",
      text: "Purchase එකෙන් පසුවත් direct phone සහ WhatsApp support අපෙන් ලැබේ.",
    },
    {
      title: "Curated Products",
      text: "Everyday use products and seller essentials carefully selected for local needs.",
    },
  ];

  return (
    <div className="relative flex-grow overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="hero-orb left-[-80px] top-20 h-52 w-52 bg-cyan-300" />
      <div className="hero-orb right-[-90px] top-0 h-64 w-64 bg-emerald-300" />

      <div className="relative mx-auto w-full max-w-7xl space-y-8">
        <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#1a2b4a] via-sky-700 to-cyan-600 px-6 py-8 text-white sm:px-9 sm:py-10">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]">
                <BadgeCheck size={14} /> About Siyatha Online
              </p>
              <h1 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                අපි කවුද?
                <span className="mt-2 block text-emerald-200">Who We Are</span>
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-100 sm:text-base">
                Siyatha Online prints photos you upload, packs parcels for people who sell online, and stocks craft materials
                for sewing, paper, and glue. We work from Kirimatiya, Batapola, and send orders across Sri Lanka.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-cyan-800 transition hover:bg-cyan-50"
                >
                  Shop Now <ArrowRight size={16} />
                </Link>
                <a
                  href="https://www.facebook.com/profile.php?id=61587396941428"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-full border border-white/35 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
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
