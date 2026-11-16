"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import {
  FINISHES,
  PRINT_FAMILIES,
  describePrintOrder,
  familyFromSize,
  findFinish,
  findPrintSize,
  formatRs,
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
};

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

  const size = findPrintSize(sizeId) ?? sizesForFamily(family)[0];
  const finish = findFinish(finishId) ?? FINISHES[0];
  const totalCopies = photos.reduce((sum, photo) => sum + photo.quantity, 0);
  const unit = size ? printUnitPrice(size.id, Math.max(totalCopies, 1)) : null;
  const total = unit == null ? 0 : unit * totalCopies;

  const bulkNote = useMemo(() => {
    if (size?.family === "passport") {
      return "Passport and visa sheets stay at the sheet price.";
    }

    if (!size || totalCopies < 12) {
      const left = 12 - totalCopies;
      return totalCopies === 0
        ? "Twelve copies of the same size save 10%. Thirty copies save 20%."
        : `Add ${left} more ${left === 1 ? "print" : "prints"} of this size for 10% off.`;
    }

    if (totalCopies >= 30) {
      return "Thirty or more copies: 20% off this size.";
    }

    return `Add ${30 - totalCopies} more prints of this size for 20% off.`;
  }, [size, totalCopies]);

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
      });
    });

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

      return [...current, ...next.slice(0, room)];
    });

    setError(problems[0] || "");
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
            {sizesForFamily(family).map((item) => {
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

          {error ? <p className="mt-3 text-sm font-medium text-[#B10C53]">{error}</p> : null}

          {photos.length > 0 ? (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {photos.map((photo) => (
                <li key={photo.localId} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-3">
                  {/* Blob previews are local only and are not a remote image source. */}
                  <img src={photo.previewUrl} alt="" className="h-20 w-20 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
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
              ))}
            </ul>
          ) : null}
        </section>
      </div>

      <aside className="surface-card rounded-[1.75rem] p-5 lg:sticky lg:top-28">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#B10C53]">Order</p>
        <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">
          {size ? size.label : "Choose a size"}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          {finish.title} photo paper{size ? ` · ${size.cm}` : ""}
        </p>
        <p className="mt-2 text-sm font-semibold text-[#B10C53]">Ships within one business day</p>
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
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : null}
          {uploading ? progress || "Uploading" : "Add prints to cart"}
        </button>
        <a
          href={whatsappHref(whatsappMessage)}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex w-full items-center justify-center rounded-full border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800"
        >
          Send this list on WhatsApp
        </a>
        <p className="mt-3 text-xs leading-5 text-slate-500">
          Cart checkout stores the photos on this site. WhatsApp is for the same list if you would rather send the pictures in the chat.
        </p>
        <Link href="/photo-prints" className="mt-4 inline-flex text-sm font-semibold text-[#B10C53]">
          Size guide and prices
        </Link>
      </aside>
    </div>
  );
}
