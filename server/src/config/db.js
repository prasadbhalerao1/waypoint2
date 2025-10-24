import mongoose from 'mongoose';

// Cache the connection to reuse across serverless invocations
let cachedConnection = null;

// Environment variables are loaded via package.json script
const connectDB = async () => {
  // Reuse existing connection if available (important for serverless)
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('✅ Using cached MongoDB connection');
    return cachedConnection;
  }

  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    cachedConnection = conn;
    console.log('✅ MongoDB connected successfully');
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    // Don't exit process in serverless - throw error to be caught by error handler
    throw new Error(`Database connection failed: ${error.message}`);
  }
};

export default connectDB;
