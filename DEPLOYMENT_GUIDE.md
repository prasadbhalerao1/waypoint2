# Deployment Guide

This guide explains how to deploy the WayPoint application to Vercel for both frontend and backend.

## URLs
- **Frontend (Production)**: https://waypoint-demo-two.vercel.app
- **Backend (Production)**: https://waypoint-demo-backend.vercel.app
- **Frontend (Local)**: http://localhost:5173
- **Backend (Local)**: http://localhost:4000

## How It Works

### CORS Configuration (Backend)
The backend uses a **comma-separated** `FRONTEND_ORIGIN` environment variable that gets parsed into an array:

```javascript
const allowedOrigins = process.env.FRONTEND_ORIGIN 
  ? process.env.FRONTEND_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:5173', 'https://waypoint-demo-two.vercel.app'];
```

This allows the backend to accept requests from multiple origins (local + production).

### API URL Configuration (Frontend)
The frontend uses `VITE_API_BASE_URL` environment variable with a fallback:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://waypoint-demo-backend.vercel.app/api/v1';
```

## Local Development Setup

### Backend (Local)
1. Navigate to `server/` directory
2. Environment files are pre-configured:
   - `.env.development` - Used for local development
   - `.env.production` - Used for production builds
3. Run: `npm install && npm run dev`
4. Backend runs on http://localhost:4000
   - `npm run dev` automatically loads `.env.development`
   - `npm start` automatically loads `.env.production`

### Frontend (Local)
1. Navigate to `Frontend/` directory
2. Environment files are pre-configured:
   - `.env.development` - Points to `http://localhost:4000/api/v1`
   - `.env.production` - Points to `https://waypoint-demo-backend.vercel.app/api/v1`
3. Run: `npm install && npm run dev`
4. Frontend runs on http://localhost:5173
   - Vite automatically loads `.env.development` in dev mode
   - Vite automatically loads `.env.production` when building

## Vercel Deployment

### Backend Deployment
1. Push code to GitHub
2. Import project in Vercel
3. Set **Root Directory** to `server`
4. Add these environment variables in Vercel dashboard:
   ```
   NODE_ENV=production
   MONGODB_URI=<your_mongodb_uri>
   CLERK_SECRET_KEY=<your_clerk_secret>
   CLERK_FRONTEND_API=<your_clerk_frontend_api>
   FRONTEND_ORIGIN=https://waypoint-demo-two.vercel.app
   AI_PROVIDER=gemini
   GEMINI_API_KEY=<your_gemini_key>
   ADMIN_EMAIL=prasad9a38@gmail.com
   ENCRYPTION_KEY=<your_encryption_key>
   EMAIL_SERVICE=gmail
   EMAIL_USER=<your_email>
   EMAIL_PASSWORD=<your_email_password>
   ```
5. Deploy
6. Your backend will be at: `https://waypoint-demo-backend.vercel.app`

### Frontend Deployment
1. Push code to GitHub
2. Import project in Vercel
3. Set **Root Directory** to `Frontend`
4. Add this environment variable in Vercel dashboard:
   ```
   VITE_API_BASE_URL=https://waypoint-demo-backend.vercel.app/api/v1
   ```
5. Deploy
6. Your frontend will be at: `https://waypoint-demo-two.vercel.app`

## Important Notes

### CORS Origins
- **DO NOT** include trailing slashes in URLs (use `https://example.com` not `https://example.com/`)
- Browsers send origins without trailing slashes, so they must match exactly
- The `.split(',')` method properly converts the comma-separated string into an array

### Environment Variables
- **Local**: Use `.env` for backend, `.env.local` for frontend
- **Production**: Set in Vercel dashboard
- Frontend env vars must be prefixed with `VITE_`

### Testing CORS
After deployment, check browser console for CORS errors. If you see:
```
Access to fetch at 'https://waypoint-demo-backend.vercel.app/api/v1/...' 
from origin 'https://waypoint-demo-two.vercel.app' has been blocked by CORS policy
```

Then verify:
1. `FRONTEND_ORIGIN` is set correctly in backend Vercel env vars
2. No trailing slashes in URLs
3. Backend is deployed and running

### Fallback Behavior
- If `FRONTEND_ORIGIN` is not set, backend defaults to: `['http://localhost:5173', 'https://waypoint-demo-two.vercel.app']`
- If `VITE_API_BASE_URL` is not set, frontend defaults to: `https://waypoint-demo-backend.vercel.app/api/v1`

This ensures the app works even without environment variables configured.

## Troubleshooting

### CORS Issues
1. Check backend logs in Vercel for "CORS blocked origin" warnings
2. Verify `FRONTEND_ORIGIN` env var in Vercel dashboard
3. Ensure no trailing slashes in URLs

### API Connection Issues
1. Check `VITE_API_BASE_URL` in frontend Vercel env vars
2. Test backend endpoint directly: `https://waypoint-demo-backend.vercel.app/api/v1/health`
3. Check browser Network tab for failed requests

### Local Development Issues
1. Ensure `.env.development` files exist in both `Frontend/` and `server/`
2. Run `npm run dev` (not `npm start`) for local development
3. Run both frontend and backend servers simultaneously

## Environment Files Summary

### Backend (`server/`)
- `.env.development` - Local development (FRONTEND_ORIGIN=http://localhost:5173)
- `.env.production` - Production deployment (FRONTEND_ORIGIN=https://waypoint-demo-two.vercel.app)
- `.env.example` - Template for new setups

### Frontend (`Frontend/`)
- `.env.development` - Local development (VITE_API_BASE_URL=http://localhost:4000/api/v1)
- `.env.production` - Production deployment (VITE_API_BASE_URL=https://waypoint-demo-backend.vercel.app/api/v1)
- `.env.example` - Template for new setups

**No manual switching needed!** The correct environment file is automatically loaded based on the command you run.
