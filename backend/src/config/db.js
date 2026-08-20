const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("Please define the MONGO_URI environment variable");
}

// Check if there is already a global connection cached
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  // If a connection already exists, reuse it instantly
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
    };

    cached.promise = mongoose
      .connect(MONGO_URI, opts)
      .then((mongooseInstance) => {
        console.log(`MongoDB Connected: ${mongooseInstance.connection.host}`);
        return mongooseInstance;
      });
  }

  try {
    //  Wait for the connection promise to resolve
    cached.conn = await cached.promise;
  } catch (error) {
    // Clear promise on error so next request tries again
    cached.promise = null;
    console.error(`MongoDB Error: ${error.message}`);
    throw error;
  }

  return cached.conn;
};

module.exports = connectDB;
