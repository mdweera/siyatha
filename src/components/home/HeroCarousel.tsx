"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

const SLIDES = [
  { src: "/carousel-01.webp", alt: "Printed photos of family, travel, and pets on a wooden table" },
  { src: "/carousel-02.webp", alt: "Photo prints of children and a family standing at the beach" },
  { src: "/carousel-06.jpg", alt: "A camera held ready to take a photo" },
];

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) {
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % SLIDES.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [paused]);

  const show = (next: number) => {
    setIndex((next + SLIDES.length) % SLIDES.length);
  };

  return (
    <section
      className="relative overflow-hidden bg-[#2b1636]"
      aria-roledescription="carousel"
      aria-label="Photo print examples"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative h-[240px] sm:h-[380px] lg:h-[460px]">
        {SLIDES.map((slide, slideIndex) => (
          <Link
            key={slide.src}
            href="/photo-prints/order"
            className={`absolute inset-0 block transition-opacity duration-500 ${slideIndex === index ? "opacity-100" : "pointer-events-none opacity-0"}`}
            aria-hidden={slideIndex !== index}
            tabIndex={slideIndex === index ? 0 : -1}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={slideIndex === 0}
              className="object-cover"
              sizes="100vw"
            />
          </Link>
        ))}
      </div>

      <button
        type="button"
        onClick={() => show(index - 1)}
        className="absolute left-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#111]"
        aria-label="Previous photo"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        type="button"
        onClick={() => show(index + 1)}
        className="absolute right-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#111]"
        aria-label="Next photo"
      >
        <ChevronRight size={22} />
      </button>

      <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
        {SLIDES.map((slide, slideIndex) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => show(slideIndex)}
            className={`h-2.5 rounded-full ${slideIndex === index ? "w-6 bg-[#F2B400]" : "w-2.5 bg-white/80"}`}
            aria-label={`Show photo ${slideIndex + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
