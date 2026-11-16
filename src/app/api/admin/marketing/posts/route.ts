import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getPrivilegedSession } from "@/lib/adminAuth";
import MarketingPost, { MarketingPostType } from "@/models/MarketingPost";

const VALID_TYPES: MarketingPostType[] = ["PRODUCT_POST", "NOTICE", "RANGE_COLLECTION"];

export async function GET(request: NextRequest) {
  try {
    const session = await getPrivilegedSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = new URL(request.url).searchParams;
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const limitValue = Number(searchParams.get("limit") || "100");
    const limit = Number.isFinite(limitValue) ? Math.min(Math.max(limitValue, 1), 200) : 100;

    const query: Record<string, unknown> = {};

    if (type && VALID_TYPES.includes(type as MarketingPostType)) {
      query.type = type;
    }

    if (status === "DRAFT" || status === "PUBLISHED") {
      query.status = status;
    }

    await dbConnect();

    const posts = await MarketingPost.find(query)
      .sort({ pinned: -1, createdAt: -1 })
      .limit(limit)
      .populate("productIds", "name images onlinePrice posPrice stockQty")
      .lean()
      .exec();

    return NextResponse.json({
      posts: JSON.parse(JSON.stringify(posts)),
    });
  } catch (error: any) {
    console.error("Marketing posts list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch marketing posts", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getPrivilegedSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const type = body?.type as MarketingPostType;
    const titleSi = String(body?.titleSi || "").trim();
    const contentSi = String(body?.contentSi || "").trim();

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: "Invalid post type" }, { status: 400 });
    }

    if (!titleSi || !contentSi) {
      return NextResponse.json(
        { error: "Sinhala title and Sinhala content are required" },
        { status: 400 }
      );
    }

    const status = body?.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
    const tags = Array.isArray(body?.tags)
      ? body.tags.map((tag: unknown) => String(tag).trim()).filter(Boolean)
      : [];

    await dbConnect();

    const post = await MarketingPost.create({
      type,
      status,
      titleSi,
      titleEn: String(body?.titleEn || "").trim() || undefined,
      contentSi,
      contentEn: String(body?.contentEn || "").trim() || undefined,
      noticeLevel:
        body?.noticeLevel === "IMPORTANT" || body?.noticeLevel === "ALERT"
          ? body.noticeLevel
          : "INFO",
      rangeName: String(body?.rangeName || "").trim() || undefined,
      productIds: Array.isArray(body?.productIds)
        ? body.productIds.filter((id: unknown) => typeof id === "string" && id.length > 0)
        : [],
      tags,
      fontKey:
        body?.fontKey === "sinhala-serif" || body?.fontKey === "display-mix"
          ? body.fontKey
          : "sinhala-sans",
      pinned: Boolean(body?.pinned),
      createdBy: {
        id: session.user.id,
        name: session.user.name || "Admin",
      },
      publishedAt: status === "PUBLISHED" ? new Date() : undefined,
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error: any) {
    console.error("Marketing post create error:", error);
    return NextResponse.json(
      { error: "Failed to create marketing post", details: error.message },
      { status: 500 }
    );
  }
}
