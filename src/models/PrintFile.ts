import mongoose from "mongoose";

export interface IPrintFile extends mongoose.Document {
  data: Buffer;
  contentType: string;
  originalName: string;
}

const PrintFileSchema = new mongoose.Schema<IPrintFile>(
  {
    data: { type: Buffer, required: true },
    contentType: { type: String, required: true },
    originalName: { type: String, default: "photo" },
  },
  { timestamps: true }
);

const PrintFile = mongoose.models.PrintFile || mongoose.model<IPrintFile>("PrintFile", PrintFileSchema);

export default PrintFile;
