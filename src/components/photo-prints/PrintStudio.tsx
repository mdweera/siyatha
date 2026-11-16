"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { trackEvent } from "@/lib/analytics";
import {
  FINISHES,
  PRINT_FAMILIES,
  describePrintOrder,
  familyFromSize,
  findFinish,
  findPrintSize,
  formatRs,
  parsePixelHint,
  photoQuality,
  printAspect,
  currentPrintPrices,
  pricedPrintSizes,
  printUnitPrice,
  sizesForFamily,
  whatsappHref,
  type FinishId,
  type PrintFamilyId,
} from "@/lib/storefront";

type DraftPhoto = {
  localId: string;
  file: File;
  previewUrl: string;
  quantity: number;
  width: number;
  height: number;
  cropX: number;
  cropY: number;
};

function measurePhoto(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const image = new window.Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => resolve({ width: 0, height: 0 });
    image.src = url;
  });
}

const MAX_PHOTOS = 40;
const MAX_BYTES = 8 * 1024 * 1024;

type PrintStudioProps = {
  initialFamily?: string;
  initialSize?: string;
};

function isFamily(value: string | undefined): value is PrintFamilyId {
  return PRINT_FAMILIES.some((family) => family.id === value);
}

function isFinish(value: string): value is FinishId {
  return FINISHES.some((finish) => finish.id === value);
}

export default function PrintStudio({ initialFamily, initialSize }: PrintStudioProps) {
  const router = useRouter();
  const addToCart = useCartStore((state) => state.addToCart);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const previews = useRef<string[]>([]);

  const startingSize = findPrintSize(initialSize || "");
  const startingFamily = startingSize?.family || (isFamily(initialFamily) ? initialFamily : "copies");

  const [family, setFamily] = useState<PrintFamilyId>(startingFamily);
  const [sizeId, setSizeId] = useState(startingSize?.id || sizesForFamily(startingFamily)[0]?.id || "4x6");
  const [finishId, setFinishId] = useState<FinishId>("lustre");
  const [photos, setPhotos] = useState<DraftPhoto[]>([]);
  const [copiesEach, setCopiesEach] = useState(1);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");

  useEffect(() => {
    return () => {
      previews.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const priceVersion = useCartStore((state) => state.priceVersion);
  const priceTable = currentPrintPrices();
  const catalog = pricedPrintSizes(priceTable);
  const size = catalog.find((item) => item.id === sizeId) ?? sizesForFamily(family, catalog)[0];
  const finish = findFinish(finishId) ?? FINISHES[0];
  const totalCopies = photos.reduce((sum, photo) => sum + photo.quantity, 0);
  const unit = size ? printUnitPrice(size.id, Math.max(totalCopies, 1), priceTable) : null;
  const total = unit == null ? 0 : unit * totalCopies;

  const bulkNote = useMemo(() => {
    if (size?.family === "passport") {
      return "Passport and visa sheets stay at the sheet price.";
    }

    if (!size || totalCopies < priceTable.bulk12Copies) {
      const left = priceTable.bulk12Copies - totalCopies;
      return totalCopies === 0
        ? `${priceTable.bulk12Copies} copies of the same size save ${priceTable.bulk12Percent}%. ${priceTable.bulk30Copies} copies save ${priceTable.bulk30Percent}%.`
        : `Add ${left} more ${left === 1 ? "print" : "prints"} of this size for ${priceTable.bulk12Percent}% off.`;
    }

    if (totalCopies >= priceTable.bulk30Copies) {
      return `${priceTable.bulk30Copies} or more copies: ${priceTable.bulk30Percent}% off this size.`;
    }

    const left = priceTable.bulk30Copies - totalCopies;
    return `Add ${left} more prints of this size for ${priceTable.bulk30Percent}% off.`;
  }, [priceTable, priceVersion, size, totalCopies]);

  const selectFamily = (nextFamily: PrintFamilyId) => {
    setFamily(nextFamily);
    const first = sizesForFamily(nextFamily)[0];
    if (first) {
      setSizeId(first.id);
    }
  };

  const addFiles = (list: FileList | File[]) => {
    const incoming = Array.from(list);
    if (incoming.length === 0) {
      return;
    }

    const next: DraftPhoto[] = [];
    const problems: string[] = [];

    incoming.forEach((file) => {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        problems.push(`${file.name} needs to be a JPG, PNG, or WEBP.`);
        return;
      }

      if (file.size > MAX_BYTES) {
        problems.push(`${file.name} is over 8 MB. Send that one on WhatsApp.`);
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      previews.current.push(previewUrl);
      next.push({
        localId: crypto.randomUUID(),
        file,
        previewUrl,
        quantity: Math.max(1, copiesEach),
        width: 0,
        height: 0,
        cropX: 50,
        cropY: 50,
      });
    });

    let kept: DraftPhoto[] = [];
    setPhotos((current) => {
      const room = MAX_PHOTOS - current.length;
      if (room <= 0) {
        problems.push(`You can add up to ${MAX_PHOTOS} photos in one order.`);
        next.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
        return current;
      }

      if (next.length > room) {
        problems.push(`Only ${room} more photo${room === 1 ? "" : "s"} fit in this order.`);
        next.slice(room).forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
      }

      kept = next.slice(0, room);
      return [...current, ...kept];
    });

    setError(problems[0] || "");
    if (kept.length > 0) {
      trackEvent("upload_started", { count: kept.length, sizeId: size?.id });
      kept.forEach((photo) => {
        void measurePhoto(photo.previewUrl).then((dims) => {
          setPhotos((current) => current.map((item) => (item.localId === photo.localId ? { ...item, ...dims } : item)));
        });
      });
    }
  };

  const removePhoto = (localId: string) => {
    setPhotos((current) => {
      const photo = current.find((item) => item.localId === localId);
      if (photo) {
        URL.revokeObjectURL(photo.previewUrl);
      }
      return current.filter((item) => item.localId !== localId);
    });
  };

  const setQuantity = (localId: string, quantity: number) => {
    const nextQuantity = Math.min(99, Math.max(1, quantity));
    setPhotos((current) =>
      current.map((photo) => (photo.localId === localId ? { ...photo, quantity: nextQuantity } : photo))
    );
  };

  const applyCopiesToAll = () => {
    const nextQuantity = Math.min(99, Math.max(1, copiesEach));
    setPhotos((current) => current.map((photo) => ({ ...photo, quantity: nextQuantity })));
  };

  const uploadPhoto = async (photo: DraftPhoto) => {
    const body = new FormData();
    body.set("file", photo.file);
    const response = await fetch("/api/photo-prints/upload", { method: "POST", body });
    const payload = (await response.json()) as { url?: string; originalName?: string; error?: string };
    if (!response.ok || !payload.url) {
      throw new Error(payload.error || `Could not upload ${photo.file.name}.`);
    }
    return payload;
  };

  const addOrderToCart = async () => {
    if (!size || unit == null || photos.length === 0) {
      setError("Add at least one photo.");
      return;
    }

    setUploading(true);
    setError("");
    trackEvent("add_to_cart", { kind: "print", sizeId: size.id, copies: totalCopies, total });

    try {
      for (let index = 0; index < photos.length; index += 1) {
        const photo = photos[index];
        setProgress(`Uploading ${index + 1} of ${photos.length}`);
        const uploaded = await uploadPhoto(photo);
        addToCart({
          _id: `print-${photo.localId}`,
          name: `${size.label} photo print · ${finish.title}`,
          price: unit,
          quantity: photo.quantity,
          image: uploaded.url || photo.previewUrl,
          kind: "print",
          detail: uploaded.originalName || photo.file.name,
          sizeId: size.id,
          finishId: finish.id,
        });
      }

      router.push("/cart");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setProgress("");
    }
  };

  const whatsappMessage = describePrintOrder({
    sizeLabel: size ? `${size.label} (${size.cm})` : "Photo print",
    finishLabel: finish.title,
    photos: photos.length,
    copies: totalCopies,
    total,
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <div className="space-y-5">
        <section className="surface-card rounded-[1.75rem] p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#B10C53]">1 · What to print</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {PRINT_FAMILIES.map((item) => {
              const active = item.id === family;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectFamily(item.id)}
                  className={`rounded-2xl border px-4 py-3 text-left transition ${
                    active ? "border-[#DE2684] bg-[#fff1d6]" : "border-slate-200 bg-white hover:border-[#CD7DA2]"
                  }`}
                >
                  <span className="block font-display text-base font-bold text-slate-900">{item.title}</span>
                  <span className="mt-1 block text-sm text-slate-600">{item.text}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="surface-card rounded-[1.75rem] p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#B10C53]">2 · Size and paper</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {sizesForFamily(family, catalog).map((item) => {
              const active = item.id === size?.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSizeId(item.id);
                    setFamily(familyFromSize(item.id));
                  }}
                  className={`rounded-2xl border px-3 py-2 text-left transition ${
                    active ? "border-[#681878] bg-[#681878] text-white" : "border-slate-200 bg-white text-slate-800 hover:border-[#CD7DA2]"
                  }`}
                >
                  <span className="block text-sm font-bold">{item.label}</span>
                  <span className={`mt-0.5 block text-xs ${active ? "text-white/80" : "text-slate-500"}`}>
                    {item.cm} · {formatRs(item.price)}
                  </span>
                </button>
              );
            })}
          </div>
          {size ? (
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {size.blurb} A sharp file is about {size.pixels}. Phone photos that are a bit smaller still print, and we message you if the picture will look soft. Paper choice does not change the price.
            </p>
          ) : null}
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {FINISHES.map((item) => {
              const active = item.id === finishId;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (isFinish(item.id)) {
                      setFinishId(item.id);
                    }
                  }}
                  className={`rounded-2xl border px-3 py-3 text-left transition ${
                    active ? "border-[#DE2684] bg-[#fff6ea]" : "border-slate-200 bg-white hover:border-[#CD7DA2]"
                  }`}
                >
                  <span className="block text-sm font-bold text-slate-900">{item.title}</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-600">{item.text}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="surface-card rounded-[1.75rem] p-4 sm:p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#B10C53]">3 · Your photos</p>
              <h2 className="mt-1 font-display text-2xl font-bold text-slate-900">Upload, then set copies</h2>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500" htmlFor="copies-each">
                Copies each
              </label>
              <input
                id="copies-each"
                type="number"
                min={1}
                max={99}
                value={copiesEach}
                onChange={(event) => setCopiesEach(Number(event.target.value) || 1)}
                className="w-16 rounded-xl border border-slate-200 px-2 py-2 text-sm"
              />
              <button
                type="button"
                onClick={applyCopiesToAll}
                className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-[#CD7DA2]"
              >
                Apply to all
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragOver(false);
              addFiles(event.dataTransfer.files);
            }}
            className={`mt-4 flex w-full flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed px-6 py-10 text-center transition ${
              dragOver ? "border-[#DE2684] bg-[#fff1d6]" : "border-[#CD7DA2]/50 bg-white hover:bg-[#fffaf0]"
            }`}
          >
            <ImagePlus className="text-[#B10C53]" />
            <span className="mt-3 font-display text-lg font-bold text-slate-900">Drop photos here or tap to choose</span>
            <span className="mt-1 max-w-md text-sm text-slate-600">
              JPG, PNG, or WEBP. Up to 8 MB each. Phone photos are fine. We print borderless, so keep faces away from the edge.
            </span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="sr-only"
            onChange={(event) => {
              if (event.target.files) {
                addFiles(event.target.files);
              }
              event.target.value = "";
            }}
          />

          {error ? <p className="mt-3 text-sm font-medium text-[var(--brand)]" role="alert">{error}</p> : null}
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Photos are stored with this order so we can print them. Staff handling the order can see them. We delete them when you ask on WhatsApp. They are not published on the site.
          </p>

          {photos.length > 0 ? (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {photos.map((photo) => {
                const target = size ? parsePixelHint(size.pixels) : null;
                const quality = target ? photoQuality(photo.width, photo.height, target.width, target.height) : "soft";
                const aspect = size ? printAspect(size) : { width: 2, height: 3 };
                const qualityText =
                  photo.width === 0
                    ? "Checking the photo…"
                    : quality === "good"
                      ? "Sharp enough for this size."
                      : quality === "soft"
                        ? "Usable. Fine detail may look soft."
                        : "This file is small for this size. It may look soft when printed.";
                const qualityClass =
                  quality === "good" ? "text-[#1F7A4D]" : quality === "small" ? "text-[var(--brand)]" : "text-[var(--ink)]";
                return (
                <li key={photo.localId} className="rounded-[12px] border border-[var(--line)] bg-white p-3">
                  <div
                    className="relative overflow-hidden rounded-[12px] bg-[var(--page)]"
                    style={{ aspectRatio: `${aspect.width} / ${aspect.height}` }}
                    onPointerDown={(event) => {
                      const box = event.currentTarget.getBoundingClientRect();
                      const place = (point: { clientX: number; clientY: number }) => {
                        const cropX = Math.min(100, Math.max(0, ((point.clientX - box.left) / box.width) * 100));
                        const cropY = Math.min(100, Math.max(0, ((point.clientY - box.top) / box.height) * 100));
                        setPhotos((current) =>
                          current.map((item) => (item.localId === photo.localId ? { ...item, cropX, cropY } : item))
                        );
                      };
                      place(event);
                      const move = (point: PointerEvent) => place(point);
                      const stop = () => {
                        window.removeEventListener("pointermove", move);
                        window.removeEventListener("pointerup", stop);
                      };
                      window.addEventListener("pointermove", move);
                      window.addEventListener("pointerup", stop);
                    }}
                  >
                    {/* Blob previews stay in the browser until checkout uploads them. */}
                    <img
                      src={photo.previewUrl}
                      alt=""
                      className="h-full w-full object-cover"
                      style={{ objectPosition: `${photo.cropX}% ${photo.cropY}%` }}
                    />
                    {size?.family === "passport" ? (
                      <div className="pointer-events-none absolute inset-[18%] rounded-[40%] border-2 border-dashed border-[var(--ink)]/60" />
                    ) : null}
                  </div>
                  <p className={`mt-2 text-xs font-semibold ${qualityClass}`}>{qualityText}</p>
                  <div className="mt-2 min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{photo.file.name}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="inline-flex items-center rounded-full border border-slate-200">
                        <button
                          type="button"
                          className="p-2 text-slate-600"
                          onClick={() => setQuantity(photo.localId, photo.quantity - 1)}
                          aria-label={`Fewer copies of ${photo.file.name}`}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{photo.quantity}</span>
                        <button
                          type="button"
                          className="p-2 text-slate-600"
                          onClick={() => setQuantity(photo.localId, photo.quantity + 1)}
                          aria-label={`More copies of ${photo.file.name}`}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePhoto(photo.localId)}
                        className="rounded-full p-2 text-slate-500 hover:bg-[#fff1d6] hover:text-[#B10C53]"
                        aria-label={`Remove ${photo.file.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </li>
                );
              })}
            </ul>
          ) : null}
        </section>
      </div>

      <aside className="surface-card rounded-[1.75rem] p-5 lg:sticky lg:top-28">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">4 · Review</p>
        <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">
          {size ? size.label : "Choose a size"}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          {finish.title} photo paper{size ? ` · ${size.cm}` : ""}
        </p>
        <p className="mt-2 text-sm text-[var(--muted)]">Ships within one business day. Delivery is added in the cart.</p>
        <dl className="mt-5 space-y-2 text-sm text-slate-700">
          <div className="flex justify-between">
            <dt>Photos</dt>
            <dd className="font-semibold">{photos.length}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Prints</dt>
            <dd className="font-semibold">{totalCopies}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Each</dt>
            <dd className="font-semibold">{unit == null ? "—" : formatRs(unit)}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs leading-5 text-slate-500">{bulkNote}</p>
        <p className="mt-4 font-display text-3xl font-black text-slate-900">{formatRs(total)}</p>
        <button
          type="button"
          onClick={addOrderToCart}
          disabled={uploading || photos.length === 0}
          className="btn-primary mt-4 w-full disabled:cursor-not-allowed disabled:bg-[var(--line)]"
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : null}
          {uploading ? progress || "Uploading" : "Add prints to cart"}
        </button>
        <a
          href={whatsappHref(whatsappMessage)}
          target="_blank"
          rel="noreferrer"
          onClick={() => trackEvent("whatsapp_click", { place: "print-studio" })}
          className="btn-whatsapp mt-2 w-full no-underline"
        >
          Send this list on WhatsApp
        </a>
        <p className="mt-3 text-xs leading-5 text-slate-500">
          Cart checkout stores the photos on this site. WhatsApp is for the same list if you would rather send the pictures in the chat.
        </p>
        <Link href="/photo-prints" className="mt-4 inline-flex text-sm font-semibold underline">
          Size guide and prices
        </Link>
      </aside>
    </div>
  );
}
