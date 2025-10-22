# WayPoint Setup Guide

## Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Clerk account
- OpenAI or Gemini API key
- Gmail account for emails

---

## Backend Setup

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the `server` directory:

```bash
# Server Configuration
PORT=4000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/waypoint
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/waypoint

# Clerk Authentication
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_FRONTEND_API=your_clerk_publishable_key

# AI Provider (choose one)
AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key_here
# OR
# AI_PROVIDER=gemini
# GEMINI_API_KEY=your_gemini_api_key_here
AI_MODEL=gpt-4o  # or gemini-2.5-flash

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=waypointplatform@gmail.com
EMAIL_PASSWORD=your_gmail_app_password

# Frontend Origin (for CORS)
FRONTEND_ORIGIN=http://localhost:5173

# Encryption Key (generate a random 32-character string)
ENCRYPTION_KEY=your_32_character_encryption_key_here
```

### 3. Get API Keys

#### Clerk Setup:
1. Go to https://clerk.com
2. Create a new application
3. Copy `CLERK_SECRET_KEY` and `CLERK_FRONTEND_API`
4. Enable email authentication

#### OpenAI Setup:
1. Go to https://platform.openai.com
2. Create API key
3. Copy to `OPENAI_API_KEY`

#### Gmail App Password:
1. Go to Google Account → Security
2. Enable 2-Factor Authentication
3. Go to App Passwords
4. Generate password for "Mail"
5. Copy to `EMAIL_PASSWORD`

### 4. Start Backend Server
```bash
npm run dev
```

Server will run on http://localhost:4000

---

## Frontend Setup

### 1. Install Dependencies
```bash
cd Frontend
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the `Frontend` directory:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:4000/api/v1

# Clerk Configuration
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

### 3. Start Frontend Server
```bash
npm run dev
```

Frontend will run on http://localhost:5173

---

## Testing the Features

### 1. Test Quick Check
1. Sign up/login to the app
2. Navigate to Chat page
3. Click "Quick Check" button
4. Answer the questions
5. Verify you receive structured results

### 2. Test Admin Dashboard
1. Login with `prasad9a38@gmail.com` or `waypointplatform@gmail.com`
2. Navigate to `/admin`
3. Verify access is granted
4. Try with another email (should be denied)

### 3. Test Forum Usernames
1. Go to Forum page
2. Create a post WITHOUT "Post anonymously" checked
3. Verify your username appears
4. Create another post WITH "Post anonymously" checked
5. Verify pseudonym appears instead

### 4. Test Booking Emails
1. Book a counseling session
2. Check email inbox
3. Verify confirmation email from waypointplatform@gmail.com
4. Verify email formatting

---

## Troubleshooting

### Backend won't start
- Check MongoDB is running
- Verify all environment variables are set
- Check port 4000 is not in use

### Quick Check not working
- Verify AI API key is valid
- Check AI_PROVIDER is set correctly
- Look for errors in server console

### Emails not sending
- Verify Gmail App Password is correct
- Check EMAIL_USER and EMAIL_PASSWORD
- Ensure 2FA is enabled on Gmail account

### Admin access denied
- Verify email matches whitelist
- Check Clerk user's primary email
- Look for logs in server console

### Forum usernames not showing
- Verify Clerk is properly configured
- Check user has username in publicMetadata
- Ensure backend can reach Clerk API

---

## Production Deployment

### Backend (Railway/Render/Heroku)
1. Set all environment variables
2. Use production MongoDB URI
3. Set `NODE_ENV=production`
4. Update `FRONTEND_ORIGIN` to production URL

### Frontend (Vercel/Netlify)
1. Set `VITE_API_BASE_URL` to production backend URL
2. Set `VITE_CLERK_PUBLISHABLE_KEY`
3. Build: `npm run build`
4. Deploy `dist` folder

---

## Security Checklist

- [ ] Change all default passwords
- [ ] Use strong encryption key
- [ ] Enable HTTPS in production
- [ ] Set proper CORS origins
- [ ] Use environment variables (never commit `.env`)
- [ ] Enable rate limiting
- [ ] Regular security updates

---

## Support

For help:
- Email: waypointplatform@gmail.com
- Check IMPLEMENTATION_SUMMARY.md for detailed documentation

---

**Happy Coding! 🚀**
