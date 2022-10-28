import { MongoClient, Db } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("mongodb.ts ERROR: environment var MONGODB_URI not defined.");
}
let cached = (global as any).mongo;

if (!cached) {
  cached = (global as any).mongo = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = MongoClient.connect(MONGODB_URI || "").then((client) => {
      return {
        client,
        db: client.db("tradeData"),
      };
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
