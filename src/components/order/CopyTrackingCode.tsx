"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CopyTrackingCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-full border border-[#111]/20 bg-white px-3 py-2 text-sm font-semibold"
      onClick={async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      }}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? "Copied" : "Copy code"}
    </button>
  );
}
