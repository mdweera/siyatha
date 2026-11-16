"use client";

import { MessageCircle, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export default function WhatsAppButton() {
  const [open, setOpen] = useState(false);
  const [draftMessage, setDraftMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+94766609143";
  const formattedPhone = useMemo(() => phoneNumber.replace(/[^0-9]/g, ""), [phoneNumber]);

  const defaultMessage = "Hello Siyatha Online, I have an inquiry about a product.";

  useEffect(() => {
    if (!open) return;
    textareaRef.current?.focus();
  }, [open]);

  const openWhatsApp = (message?: string) => {
    const finalMessage = (message ?? draftMessage ?? "").trim() || defaultMessage;
    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(finalMessage)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleSend = () => {
    openWhatsApp(draftMessage);
    setOpen(false);
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-24 left-3 z-50 w-[min(92vw,380px)]">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/70">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Chat with Siyatha</p>
                  <p className="text-xs text-slate-500">Sends via WhatsApp Web</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 px-5 py-4">
              <label className="block text-xs font-semibold text-slate-600">Your message</label>
              <textarea
                ref={textareaRef}
                value={draftMessage}
                onChange={(e) => setDraftMessage(e.target.value)}
                placeholder="Type your message here..."
                rows={3}
                className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
              />

              <button
                type="button"
                onClick={handleSend}
                className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Send
              </button>

              <button
                type="button"
                onClick={() => {
                  openWhatsApp();
                  setOpen(false);
                }}
                className="w-full rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-300/60 transition hover:brightness-105"
              >
                Contact on WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-2.5 left-3 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-300/50 transition-transform hover:scale-105"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        <span className="absolute inset-0 rounded-full border border-emerald-300/60 animate-ping" />
        <MessageCircle size={22} />
      </button>
    </>
  );
}