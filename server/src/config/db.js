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
      console.error('❌ MONGODB_URI environment variable is not defined');
      console.error('   Available env vars:', Object.keys(process.env).filter(k => k.includes('MONGO')).join(', ') || 'none');
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    console.log('🔗 Connecting to MongoDB...');
    console.log('   URI starts with:', process.env.MONGODB_URI.substring(0, 20) + '...');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // Timeout after 10s instead of 30s
      socketTimeoutMS: 45000,
    });
    
    cachedConnection = conn;
    console.log('✅ MongoDB connected successfully');
    console.log('   Database:', mongoose.connection.name);
    console.log('   Host:', mongoose.connection.host);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error');
    console.error('   Error name:', error.name);
    console.error('   Error message:', error.message);
    console.error('   Error code:', error.code);
    if (error.reason) {
      console.error('   Reason:', error.reason);
    }
    // Don't exit process in serverless - throw error to be caught by error handler
    throw new Error(`Database connection failed: ${error.message}`);
  }
};

export default connectDB;
