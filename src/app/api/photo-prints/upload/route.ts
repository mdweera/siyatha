import { createHash, randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { printFileExtension } from "@/lib/printFiles";

export const runtime = "nodejs";

const MAX_BYTES = 12 * 1024 * 1024;

function cloudinarySignature(params: Record<string, string>, secret: string): string {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return createHash("sha1").update(`${payload}${secret}`).digest("hex");
}

async function saveOnCloudinary(bytes: Buffer, filename: string, extension: string): Promise<string | null> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  const timestamp = String(Math.floor(Date.now() / 1000));
  const folder = "siyatha/prints";
  const signed: Record<string, string> = { folder, timestamp };
  if (extension === "heic" || extension === "heif") {
    signed.format = "jpg";
  }

  const body = new FormData();
  body.set("file", new Blob([new Uint8Array(bytes)]), filename);
  body.set("api_key", apiKey);
  body.set("timestamp", timestamp);
  body.set("folder", folder);
  body.set("signature", cloudinarySignature(signed, apiSecret));
  if (signed.format) {
    body.set("format", signed.format);
  }

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body,
  });
  const payload = (await response.json()) as { secure_url?: string; error?: { message?: string } };
  if (!response.ok || !payload.secure_url) {
    throw new Error(payload.error?.message || "Could not store that photo.");
  }

  return payload.secure_url;
}

async function saveOnDisk(bytes: Buffer, extension: string): Promise<string> {
  const storedExtension = extension === "heic" || extension === "heif" ? extension : extension;
  const filename = `${Date.now()}-${randomUUID()}.${storedExtension}`;
  const directory = path.join(process.cwd(), "public", "uploads", "prints");
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), bytes);
  return `/uploads/prints/${filename}`;
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose a photo to upload." }, { status: 400 });
    }

    const extension = printFileExtension(file.name, file.type);
    if (!extension) {
      return NextResponse.json({ error: "Use a JPG, PNG, WEBP, or iPhone HEIC photo." }, { status: 400 });
    }

    if (file.size <= 0 || file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Each photo must be under 12 MB." }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const safeName = file.name.replace(/[^\w.\- ()]/g, "").slice(0, 120) || "photo";
    let url = await saveOnCloudinary(bytes, safeName, extension);
    if (!url) {
      url = await saveOnDisk(bytes, extension);
    }

    return NextResponse.json({ url, originalName: safeName });
  } catch (error) {
    console.error("Photo print upload failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Could not save that photo. Please try again." }, { status: 500 });
  }
}
