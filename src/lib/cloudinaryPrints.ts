import { createHash } from "crypto";

type CloudinaryCreds = { cloudName: string; apiKey: string; apiSecret: string };

export function printInboxFolder(now = new Date()): string {
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  return `siyatha/prints/inbox/${year}/${month}/${day}`;
}

export function cloudinaryCreds(): CloudinaryCreds | null {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  if (cloudName && apiKey && apiSecret) {
    return { cloudName, apiKey, apiSecret };
  }

  const raw = process.env.CLOUDINARY_URL?.trim();
  if (!raw) {
    return null;
  }

  try {
    const parsed = new URL(raw);
    const fromUrl = {
      cloudName: parsed.hostname,
      apiKey: decodeURIComponent(parsed.username),
      apiSecret: decodeURIComponent(parsed.password),
    };
    if (!fromUrl.cloudName || !fromUrl.apiKey || !fromUrl.apiSecret) {
      return null;
    }
    return fromUrl;
  } catch {
    return null;
  }
}

function signature(params: Record<string, string>, secret: string): string {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return createHash("sha1").update(`${payload}${secret}`).digest("hex");
}

export function cloudinaryPublicId(url: string): string | null {
  const match = url.match(/\/image\/upload\/(?:v\d+\/)?(.+)\.[a-z0-9]+(?:\?|$)/i);
  return match ? match[1] : null;
}

export async function movePrintToOrder(url: string, orderNumber: string, index: number): Promise<string> {
  const creds = cloudinaryCreds();
  const from = cloudinaryPublicId(url);
  if (!creds || !from || !from.startsWith("siyatha/prints/")) {
    return url;
  }

  const to = `siyatha/prints/orders/${orderNumber}/${String(index + 1).padStart(2, "0")}`;
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signed = { from_public_id: from, timestamp, to_public_id: to };
  const body = new URLSearchParams({
    ...signed,
    api_key: creds.apiKey,
    signature: signature(signed, creds.apiSecret),
  });

  const response = await fetch(`https://api.cloudinary.com/v1_1/${creds.cloudName}/image/rename`, {
    method: "POST",
    body,
  });
  const payload = (await response.json()) as { secure_url?: string };
  return response.ok && payload.secure_url ? payload.secure_url : url;
}
