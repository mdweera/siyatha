import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import UserTrackingEvent from "@/models/UserTrackingEvent";

function buildVisitorId() {
  return `v_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const session = await getServerSession(authOptions);

    await dbConnect();

    await UserTrackingEvent.create({
      visitorId:
        typeof payload?.visitorId === "string" && payload.visitorId.trim().length > 0
          ? payload.visitorId.trim()
          : buildVisitorId(),
      sessionId: typeof payload?.sessionId === "string" ? payload.sessionId : undefined,
      userId: session?.user?.id,
      userRole: session?.user?.role,
      eventName:
        typeof payload?.eventName === "string" && payload.eventName.trim().length > 0
          ? payload.eventName
          : "page_view",
      pageUrl: typeof payload?.pageUrl === "string" ? payload.pageUrl : "/",
      pageTitle: typeof payload?.pageTitle === "string" ? payload.pageTitle : undefined,
      referrer: typeof payload?.referrer === "string" ? payload.referrer : undefined,
      userAgent: request.headers.get("user-agent") || undefined,
      utmSource: typeof payload?.utmSource === "string" ? payload.utmSource : undefined,
      utmMedium: typeof payload?.utmMedium === "string" ? payload.utmMedium : undefined,
      utmCampaign: typeof payload?.utmCampaign === "string" ? payload.utmCampaign : undefined,
      utmTerm: typeof payload?.utmTerm === "string" ? payload.utmTerm : undefined,
      utmContent: typeof payload?.utmContent === "string" ? payload.utmContent : undefined,
      metadata:
        payload?.metadata && typeof payload.metadata === "object" ? payload.metadata : undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Tracking API error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
