import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import PrintFile from "@/models/PrintFile";

export const runtime = "nodejs";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!mongoose.isValidObjectId(id)) {
    return new NextResponse("Not found", { status: 404 });
  }

  await dbConnect();
  const doc = await PrintFile.findById(id);
  if (!doc?.data) {
    return new NextResponse("Not found", { status: 404 });
  }

  const raw = doc.data as unknown;
  const bytes = Buffer.isBuffer(raw)
    ? raw
    : raw && typeof raw === "object" && "value" in raw && typeof (raw as { value?: unknown }).value === "function"
      ? Buffer.from((raw as { value: () => Uint8Array }).value())
      : Buffer.from(raw as Uint8Array);
  const download = new URL(request.url).searchParams.get("download") === "1";

  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": doc.contentType || "image/jpeg",
      "Cache-Control": "private, max-age=31536000",
      "Content-Length": String(bytes.length),
      ...(download ? { "Content-Disposition": `attachment; filename="${doc.originalName || "photo.jpg"}"` } : {}),
    },
  });
}
