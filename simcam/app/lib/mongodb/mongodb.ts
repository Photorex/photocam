import mongoose from "mongoose";
import { logger } from "@/app/lib/logger";

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) {
  logger.critical('MONGODB', 'MONGODB_URI environment variable not defined');
  throw new Error("MONGODB_URI must be defined");
}

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
        logger.warn('MONGODB', 'Cached MongoDB connection is no longer active, creating new connection', {
          readyState: cached.conn.connection.readyState,
        });
        cached.conn = null;
        cached.promise = null;
      }
    } catch (error) {
      logger.error('MONGODB', 'Cached MongoDB connection failed, creating new connection', {
        error: error instanceof Error ? error.message : 'Unknown error',
      }, error instanceof Error ? error : undefined);
      cached.conn = null;
      cached.promise = null;
    }
  }
  
  if (!cached.promise) {
    logger.info('MONGODB', 'Creating new MongoDB connection', {
      maxPoolSize: 10,
      minPoolSize: 2,
      heartbeatFrequency: '10s',
    });

    cached.promise = mongoose.connect(MONGODB_URI, {
        maxPoolSize: 10,                 // Changed from 100
        minPoolSize: 2,                  // Changed from 10
        serverSelectionTimeoutMS: 30_000,
        socketTimeoutMS: 120_000,
        heartbeatFrequencyMS: 10_000,
        bufferCommands: false,
      });
  }
  
  try {
    cached.conn = await cached.promise;
    logger.info('MONGODB', 'Successfully connected to MongoDB', {
      readyState: cached.conn.connection.readyState,
      host: cached.conn.connection.host,
    });
    return cached.conn;
  } catch (error) {
    logger.critical('MONGODB', 'Failed to connect to MongoDB', {
      error: error instanceof Error ? error.message : 'Unknown error',
    }, error instanceof Error ? error : undefined);
    cached.promise = null;
    throw error;
  }
}

// Monitor MongoDB connection events
if (typeof window === 'undefined') {
  mongoose.connection.on('connected', () => {
    logger.info('MONGODB', 'Mongoose connected to MongoDB');
  });

  mongoose.connection.on('error', (err) => {
    logger.error('MONGODB', 'Mongoose connection error', { error: err.message }, err);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MONGODB', 'Mongoose disconnected from MongoDB');
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('MONGODB', 'Mongoose reconnected to MongoDB');
  });

  mongoose.connection.on('close', () => {
    logger.warn('MONGODB', 'Mongoose connection closed');
  });
}