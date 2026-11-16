import mongoose from 'mongoose';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type OrderSource = 'POS' | 'ONLINE';

export interface IOrder extends mongoose.Document {
  userId?: mongoose.Types.ObjectId;
  customerName?: string;
  phone?: string;
  source: OrderSource;

  items: {
    productId?: mongoose.Types.ObjectId;
    name: string;
    quantity: number;
    price: number;
    image: string;
    subtotal: number;
    kind?: "product" | "print";
    detail?: string;
  }[];

  totalAmount: number;
  deliveryCharge?: number;
  status: OrderStatus;

  // Online-specific fields
  orderNumber: string;
  paymentMethod: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    notes?: string;
  };
  trackingNumber?: string;
  courierService?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    customerName: { type: String },
    phone: { type: String },
    source: { type: String, enum: ['POS', 'ONLINE'], default: 'ONLINE' },

    items: [{
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      name: { type: String, required: true },
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true, min: 0 },
      image: { type: String },
      subtotal: { type: Number, required: true, min: 0 },
      kind: { type: String, enum: ['product', 'print'], default: 'product' },
      detail: { type: String },
    }],

    totalAmount: { type: Number, required: true, min: 0 },
    deliveryCharge: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },

    // Online-specific
    orderNumber: { type: String, unique: true },
    paymentMethod: { type: String, required: true },
    shippingAddress: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      notes: { type: String },
    },
    trackingNumber: { type: String },
    courierService: { type: String },
  },
  {
    timestamps: true,
    collection: 'online_orders' // Explicit collection name
  }
);

// Indexes for performance
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);