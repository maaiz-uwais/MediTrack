const mongoose = require('mongoose');

let cached = global._mongooseConn;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  if (!cached) {
    cached = global._mongooseConn = mongoose.connect(process.env.MONGO_URI);
  }

  try {
    const conn = await cached;
    console.log(`[MediTrack DB] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn.connection;
  } catch (error) {
    cached = global._mongooseConn = null;
    console.error(`[MediTrack DB] Connection Error: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;