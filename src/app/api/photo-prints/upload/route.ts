import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

const MAX_BYTES = 8 * 1024 * 1024;

const ALLOWED = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose a photo to upload." }, { status: 400 });
    }

    const extension = ALLOWED.get(file.type);
    if (!extension) {
      return NextResponse.json({ error: "Use a JPG, PNG, or WEBP photo." }, { status: 400 });
    }

    if (file.size <= 0 || file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Each photo must be under 8 MB." }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${randomUUID()}.${extension}`;
    const directory = path.join(process.cwd(), "public", "uploads", "prints");
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, filename), bytes);

    return NextResponse.json({
      url: `/uploads/prints/${filename}`,
      originalName: file.name.replace(/[^\w.\- ()]/g, "").slice(0, 120) || "photo",
    });
  } catch (error) {
    console.error("Photo print upload failed:", error);
    return NextResponse.json({ error: "Could not save that photo. Please try again." }, { status: 500 });
  }
}
