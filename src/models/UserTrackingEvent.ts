import mongoose from "mongoose";

export interface IUserTrackingEvent extends mongoose.Document {
  visitorId: string;
  sessionId?: string;
  userId?: string;
  userRole?: string;
  eventName: string;
  pageUrl: string;
  pageTitle?: string;
  referrer?: string;
  userAgent?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const UserTrackingEventSchema = new mongoose.Schema(
  {
    visitorId: { type: String, required: true, index: true },
    sessionId: { type: String },
    userId: { type: String, index: true },
    userRole: { type: String },
    eventName: { type: String, required: true, index: true },
    pageUrl: { type: String, required: true, index: true },
    pageTitle: { type: String },
    referrer: { type: String },
    userAgent: { type: String },
    utmSource: { type: String },
    utmMedium: { type: String },
    utmCampaign: { type: String, index: true },
    utmTerm: { type: String },
    utmContent: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  {
    timestamps: true,
    collection: "online_user_tracking_events",
  }
);

UserTrackingEventSchema.index({ createdAt: -1 });
UserTrackingEventSchema.index({ visitorId: 1, createdAt: -1 });

export default mongoose.models.UserTrackingEvent ||
  mongoose.model<IUserTrackingEvent>("UserTrackingEvent", UserTrackingEventSchema);
