import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getPrivilegedSession } from "@/lib/adminAuth";
import UserTrackingEvent from "@/models/UserTrackingEvent";

export async function GET(request: NextRequest) {
  try {
    const session = await getPrivilegedSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const daysParam = Number(new URL(request.url).searchParams.get("days") || "30");
    const days = Number.isFinite(daysParam) && daysParam > 0 ? Math.min(daysParam, 365) : 30;

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    await dbConnect();

    const [
      totalEvents,
      uniqueVisitors,
      topPages,
      topEvents,
      dailyTrend,
      recentEvents,
    ] = await Promise.all([
      UserTrackingEvent.countDocuments({ createdAt: { $gte: since } }),
      UserTrackingEvent.distinct("visitorId", { createdAt: { $gte: since } }),
      UserTrackingEvent.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: "$pageUrl", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { _id: 0, pageUrl: "$_id", count: 1 } },
      ]),
      UserTrackingEvent.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: "$eventName", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { _id: 0, eventName: "$_id", count: 1 } },
      ]),
      UserTrackingEvent.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
              },
            },
            events: { $sum: 1 },
            visitors: { $addToSet: "$visitorId" },
          },
        },
        {
          $project: {
            _id: 0,
            date: "$_id",
            events: 1,
            uniqueVisitors: { $size: "$visitors" },
          },
        },
        { $sort: { date: 1 } },
      ]),
      UserTrackingEvent.find({ createdAt: { $gte: since } })
        .sort({ createdAt: -1 })
        .limit(25)
        .select("eventName pageUrl pageTitle visitorId userRole createdAt utmCampaign")
        .lean(),
    ]);

    return NextResponse.json({
      summary: {
        days,
        totalEvents,
        totalUniqueVisitors: uniqueVisitors.length,
      },
      topPages,
      topEvents,
      dailyTrend,
      recentEvents,
    });
  } catch (error: any) {
    console.error("Admin tracking fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tracking analytics", details: error.message },
      { status: 500 }
    );
  }
}
