// api/_lib/db.js
// Mongoose connection cached across warm serverless invocations
import mongoose from 'mongoose';

let cached = global._mongooseCache;
if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI environment variable is not set');

    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
      maxPoolSize: 5,
    }).then(m => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
