import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getPrivilegedSession } from "@/lib/adminAuth";
import MarketingPost from "@/models/MarketingPost";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getPrivilegedSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();

    const update: Record<string, unknown> = {};

    if (typeof body?.titleSi === "string") update.titleSi = body.titleSi.trim();
    if (typeof body?.titleEn === "string") update.titleEn = body.titleEn.trim() || undefined;
    if (typeof body?.contentSi === "string") update.contentSi = body.contentSi.trim();
    if (typeof body?.contentEn === "string") update.contentEn = body.contentEn.trim() || undefined;
    if (typeof body?.rangeName === "string") update.rangeName = body.rangeName.trim() || undefined;
    if (Array.isArray(body?.productIds)) update.productIds = body.productIds;
    if (Array.isArray(body?.tags)) update.tags = body.tags;

    if (body?.type === "PRODUCT_POST" || body?.type === "NOTICE" || body?.type === "RANGE_COLLECTION") {
      update.type = body.type;
    }

    if (body?.status === "DRAFT" || body?.status === "PUBLISHED") {
      update.status = body.status;
      update.publishedAt = body.status === "PUBLISHED" ? new Date() : undefined;
    }

    if (body?.noticeLevel === "INFO" || body?.noticeLevel === "IMPORTANT" || body?.noticeLevel === "ALERT") {
      update.noticeLevel = body.noticeLevel;
    }

    if (body?.fontKey === "sinhala-sans" || body?.fontKey === "sinhala-serif" || body?.fontKey === "display-mix") {
      update.fontKey = body.fontKey;
    }

    if (typeof body?.pinned === "boolean") {
      update.pinned = body.pinned;
    }

    await dbConnect();

    const post = await MarketingPost.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ post: JSON.parse(JSON.stringify(post)) });
  } catch (error: any) {
    console.error("Marketing post patch error:", error);
    return NextResponse.json(
      { error: "Failed to update marketing post", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getPrivilegedSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    await dbConnect();

    const deleted = await MarketingPost.findByIdAndDelete(id).lean();

    if (!deleted) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Marketing post delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete marketing post", details: error.message },
      { status: 500 }
    );
  }
}
