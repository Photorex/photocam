import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) throw new Error("MONGODB_URI must be defined");

interface Cached {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

/** Global cache – reused by every hot-reload / API route execution */
let cached: Cached = (global as any)._mongooseCache ?? {
  conn: null,
  promise: null,
};
(global as any)._mongooseCache = cached;

export async function connectMongoDB() {
  if (cached.conn) {
    // Test the connection before returning cached one
    try {
      // For mongoose, we can use the connection state
      if (cached.conn.connection.readyState === 1) { // 1 = connected
        return cached.conn;
      } else {
        console.log("Cached MongoDB connection is no longer active, creating new connection...");
        cached.conn = null;
        cached.promise = null;
      }
    } catch (error) {
      console.log("Cached MongoDB connection failed, creating new connection...");
      cached.conn = null;
      cached.promise = null;
    }
  }
  
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      maxPoolSize: 50,                // you already set this
      serverSelectionTimeoutMS: 30_000,
      socketTimeoutMS: 120_000,
      heartbeatFrequencyMS: 30_000, // Add heartbeat to detect stale connections
      bufferCommands: false,
    });
  }
  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
}