const mongoose = require("mongoose");

let isConnected = false;

/**
 * Connect to MongoDB. The interview flow works without a DB (results just won't
 * be persisted), so a failed connection logs a warning instead of crashing the
 * whole server.
 */
async function connectDB() {
  const uri = process.env.MONGODB_URL;
  if (!uri) {
    console.warn("[db] MONGODB_URL not set — results will not be persisted.");
    return false;
  }
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    isConnected = true;
    console.log("[db] Connected to MongoDB");
    return true;
  } catch (err) {
    isConnected = false;
    console.warn(`[db] Could not connect to MongoDB: ${err.message}`);
    return false;
  }
}

function dbReady() {
  return isConnected && mongoose.connection.readyState === 1;
}

module.exports = { connectDB, dbReady, mongoose };
