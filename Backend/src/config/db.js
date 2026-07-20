
import mongoose from "mongoose";

const MONGODB_URI = process.env.dbUrl;

if (!MONGODB_URI) {
  throw new Error("Missing dbUrl environment variable");
}

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbinit() {
  try {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
      cached.promise = mongoose.connect(MONGODB_URI).then((m) => m);
    }

    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    throw err;
  }
}

export { dbinit };