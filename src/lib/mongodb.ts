import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalCache = global as typeof globalThis & { mongoose?: MongooseCache };
const cached: MongooseCache = globalCache.mongoose ?? { conn: null, promise: null };
globalCache.mongoose = cached;

/**
 * Open the shop database on first use.
 * Do not throw while the module is imported. Vercel collects route modules
 * during `next build` before runtime env vars are required.
 */
export default async function dbConnect(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error("Please define the MONGODB_URI environment variable.");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, { bufferCommands: false }).then((connection) => connection);
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
}
