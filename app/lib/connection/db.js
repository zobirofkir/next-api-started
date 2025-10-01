import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

let cached = global.mongoose;

if (!cached) {
  global.mongoose = { conn: null, promise: null };
  cached = global.mongoose;
}

export default async function connect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!MONGODB_URI) {
    throw new Error('Server misconfiguration: missing MONGODB_URI');
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    }).then((mongooseInstance) => mongooseInstance);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}




