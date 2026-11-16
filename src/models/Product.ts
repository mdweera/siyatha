import mongoose from 'mongoose';

export interface IProduct extends mongoose.Document {
  name: string;
  description: string;
  sku: string;
  barcode: string;
  category: string;
  brand: string;
  images: string[];
  
  // POS Pricing (Hidden from staff/users)
  costPrice: number;
  posPrice: number;
  stockQty: number;

  // Online Store
  isPublishedOnline: boolean;
  onlinePrice?: number; // Override or use posPrice
  specifications: Record<string, string>;
  warrantyPeriod: string; // e.g., '1 Year', '6 Months'
  
  // Budget Lane categorization
  budgetLane?: 'best-value' | 'best-products' | 'premium' | 'mixed';
}

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    sku: { type: String, unique: true },
    barcode: { type: String },
    category: { type: String, index: true },
    brand: { type: String },
    images: [{ type: String }],

    costPrice: { type: Number, required: true }, // Admin only
    posPrice: { type: Number, required: true },
    stockQty: { type: Number, default: 0 },

    isPublishedOnline: { type: Boolean, default: false },
    onlinePrice: { type: Number },
    specifications: { type: Map, of: String },
    warrantyPeriod: { type: String },
    
    budgetLane: { 
      type: String, 
      enum: ['best-value', 'best-products', 'premium', 'mixed'],
      default: 'mixed'
    },
  },
  { timestamps: true, collection: 'online_products' }
);

export default mongoose.models.OnlineProduct || mongoose.model<IProduct>('OnlineProduct', ProductSchema);