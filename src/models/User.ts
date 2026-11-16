import mongoose from 'mongoose';

export type UserRole = 'ADMIN' | 'STAFF' | 'USER';

export interface IUser extends mongoose.Document {
  name: string;
  email?: string;
  phone: string;
  password?: string;
  role: UserRole;
  favorites: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    // Link to POS via phone
    phone: { type: String, required: true, unique: true }, 
    password: { type: String }, // Optional for POS customers who just verified phone
    role: { 
      type: String, 
      enum: ['ADMIN', 'STAFF', 'USER'], 
      default: 'USER' 
    },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'OnlineProduct' }],
  },
  { timestamps: true, collection: 'online_users' }
);

export default mongoose.models.OnlineUser || mongoose.model<IUser>('OnlineUser', UserSchema);