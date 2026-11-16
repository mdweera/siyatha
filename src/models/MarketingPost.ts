import mongoose from "mongoose";

export type MarketingPostType = "PRODUCT_POST" | "NOTICE" | "RANGE_COLLECTION";
export type MarketingPostStatus = "DRAFT" | "PUBLISHED";
export type MarketingPostFont = "sinhala-sans" | "sinhala-serif" | "display-mix";

export interface IMarketingPost extends mongoose.Document {
  type: MarketingPostType;
  status: MarketingPostStatus;
  titleSi: string;
  titleEn?: string;
  contentSi: string;
  contentEn?: string;
  noticeLevel: "INFO" | "IMPORTANT" | "ALERT";
  rangeName?: string;
  productIds: mongoose.Types.ObjectId[];
  tags: string[];
  fontKey: MarketingPostFont;
  pinned: boolean;
  createdBy?: {
    id: string;
    name: string;
  };
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MarketingPostSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["PRODUCT_POST", "NOTICE", "RANGE_COLLECTION"],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED"],
      default: "DRAFT",
      index: true,
    },
    titleSi: { type: String, required: true },
    titleEn: { type: String },
    contentSi: { type: String, required: true },
    contentEn: { type: String },
    noticeLevel: {
      type: String,
      enum: ["INFO", "IMPORTANT", "ALERT"],
      default: "INFO",
    },
    rangeName: { type: String },
    productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "OnlineProduct" }],
    tags: [{ type: String }],
    fontKey: {
      type: String,
      enum: ["sinhala-sans", "sinhala-serif", "display-mix"],
      default: "sinhala-sans",
    },
    pinned: { type: Boolean, default: false, index: true },
    createdBy: {
      id: { type: String },
      name: { type: String },
    },
    publishedAt: { type: Date },
  },
  {
    timestamps: true,
    collection: "marketing_posts",
  }
);

MarketingPostSchema.index({ createdAt: -1 });

export default mongoose.models.MarketingPost ||
  mongoose.model<IMarketingPost>("MarketingPost", MarketingPostSchema);
