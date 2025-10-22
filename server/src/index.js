/**
 * WayPoint Backend Server
 * Node.js + Express + Mongoose with Clerk Auth
 * ES Modules enabled
 */

import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import corsMiddleware from './middleware/cors.js';
import errorHandler from './middleware/errorHandler.js';
import { clerkMiddleware } from '@clerk/express';

// Import routes
import userRoutes from './routes/user.js';
import chatRoutes from './routes/chat.js';
import bookingRoutes from './routes/bookings.js';
import resourceRoutes from './routes/resources.js';
import forumRoutes from './routes/forum.js';
import adminRoutes from './routes/admin.js';
import screeningRoutes from './routes/screening.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Security middleware
app.use(helmet());

// CORS middleware (custom implementation with allowlist)
app.use(corsMiddleware);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Clerk authentication middleware
app.use(clerkMiddleware({
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.CLERK_FRONTEND_API
}));

// Rate limiting - protect against abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/resources', resourceRoutes);
app.use('/api/v1/forum', forumRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/screening', screeningRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.info(`✅ WayPoint Server running on port ${PORT}`);
  console.info(`🌐 Frontend origins: ${process.env.FRONTEND_ORIGIN}`);
  console.info(`🗄️  MongoDB: ${process.env.MONGODB_URI ? process.env.MONGODB_URI.replace(/:\/\/[^@]+@/, '://<credentials>@') : 'Not configured'}`);
  console.info(`🔐 Clerk: ${process.env.CLERK_SECRET_KEY ? 'Configured' : 'Not configured'}`);
  const aiProvider = process.env.AI_PROVIDER || 'openai';
  const aiConfigured = (aiProvider === 'openai' && process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') ||
                       (aiProvider === 'gemini' && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here');
  console.info(`🤖 AI Provider: ${aiProvider} (${aiConfigured ? 'Configured' : 'Using fallback templates'})`);
});
