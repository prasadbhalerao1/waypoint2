/**
 * Vercel Serverless Function Entry Point
 * This file exports the Express app for Vercel's serverless environment
 */

import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectDB from '../src/config/db.js';
import corsMiddleware from '../src/middleware/cors.js';
import errorHandler from '../src/middleware/errorHandler.js';
import { clerkMiddleware } from '@clerk/express';

// Import routes
import userRoutes from '../src/routes/user.js';
import chatRoutes from '../src/routes/chat.js';
import bookingRoutes from '../src/routes/bookings.js';
import resourceRoutes from '../src/routes/resources.js';
import forumRoutes from '../src/routes/forum.js';
import adminRoutes from '../src/routes/admin.js';
import screeningRoutes from '../src/routes/screening.js';
import quickCheckRoutes from '../src/routes/quickCheck.js';

// Connect to MongoDB (will reuse connection across invocations)
connectDB();

const app = express();

// CORS middleware MUST be first (custom implementation with allowlist)
app.use(corsMiddleware);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

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

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'WayPoint Backend API',
    version: '1.0.0',
    status: 'running'
  });
});

// API Routes
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/resources', resourceRoutes);
app.use('/api/v1/forum', forumRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/screening', screeningRoutes);
app.use('/api/v1/quick-check', quickCheckRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Export the Express app for Vercel serverless
export default app;
